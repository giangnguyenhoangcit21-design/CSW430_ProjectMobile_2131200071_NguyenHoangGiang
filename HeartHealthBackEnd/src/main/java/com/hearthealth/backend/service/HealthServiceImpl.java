package com.hearthealth.backend.service;

import com.hearthealth.backend.dto.*;
import com.hearthealth.backend.entity.DailyMetric;
import com.hearthealth.backend.entity.HealthRecord;
import com.hearthealth.backend.entity.User;
import com.hearthealth.backend.repository.DailyMetricRepository;
import com.hearthealth.backend.repository.HealthRecordRepository;
import com.hearthealth.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HealthServiceImpl implements HealthService {

    private final HealthRecordRepository healthRecordRepository;
    private final DailyMetricRepository dailyMetricRepository;
    private final UserRepository userRepository;

    private User findUserByIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new com.hearthealth.backend.exception.BadRequestException("Chưa cung cấp thông tin tài khoản (Email)");
        }
        String idStr = identifier.trim();
        return userRepository.findByEmail(idStr)
                .orElseThrow(() -> new com.hearthealth.backend.exception.UserNotFoundException("Tài khoản không tồn tại trên hệ thống"));
    }

    @Override
    public HealthAssessmentResponse assessHealth(HealthAssessmentRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail() : "";
        User user = findUserByIdentifier(identifier);

        // Update user profile from screening data
        boolean isUpdated = false;
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
            isUpdated = true;
        }
        if (request.getAge() != null) {
            user.setAge(request.getAge());
            isUpdated = true;
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender());
            isUpdated = true;
        }
        if (isUpdated) {
            userRepository.save(user);
        }

        // 1. Logic Processing
        int sysBP = 0;
        int diaBP = 0;
        if (request.getBloodPressure() != null && request.getBloodPressure().contains("/")) {
            String[] parts = request.getBloodPressure().split("/");
            sysBP = parseSafe(parts[0]);
            diaBP = parseSafe(parts[1]);
        }
        
        int hr = parseSafe(request.getHeartRate());
        int chol = parseSafe(request.getCholesterol());
        
        long numComorbidities = 0;
        if (request.getComorbidities() != null) {
            numComorbidities = request.getComorbidities().values().stream().filter(v -> v).count();
        }

        HealthAssessmentResponse response = getAssessment(request.getChestPain(), request.getBreathlessness(), 
                                                           sysBP, diaBP, hr, chol, request.getAge(), numComorbidities, request.getLang());

        // 2. Save HealthRecord to Database
        String comorbiditiesStr = "";
        if (request.getComorbidities() != null) {
            comorbiditiesStr = request.getComorbidities().entrySet().stream()
                    .filter(Map.Entry::getValue)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.joining(","));
        }

        HealthRecord record = HealthRecord.builder()
                .user(user)
                .age(request.getAge())
                .gender(request.getGender())
                .bloodPressure(request.getBloodPressure())
                .heartRate(hr)
                .weight(parseSafeDouble(request.getWeight()))
                .cholesterol(chol)
                .chestPain(request.getChestPain())
                .breathlessness(request.getBreathlessness())
                .comorbidities(comorbiditiesStr)
                .assessmentTitle(response.getTitle())
                .assessmentColor(response.getColor())
                .build();
                
        healthRecordRepository.save(record);

        // 3. Seed initial metrics into DailyMetric table so Overview screen gets populated
        DailyMetric initialMetric = DailyMetric.builder()
                .user(user)
                .sysBP(sysBP > 0 ? sysBP : null)
                .diaBP(diaBP > 0 ? diaBP : null)
                .bloodPressure(request.getBloodPressure())
                .heartRate(hr > 0 ? hr : null)
                .cholesterol(chol > 0 ? chol : null)
                .weight(parseSafeDouble(request.getWeight()) > 0 ? parseSafeDouble(request.getWeight()) : null)
                .source("SCREENING")
                .build();
        dailyMetricRepository.save(initialMetric);

        // Mark user as having completed screening
        user.setScreeningCompleted(true);
        userRepository.save(user);

        return response;
    }

    @Override
    public void saveDailyMetric(DailyMetricRequest request) {
        User user = findUserByIdentifier(request.getEmail());

        java.time.LocalDate today = java.time.LocalDate.now();
        List<DailyMetric> userMetrics = dailyMetricRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        Optional<DailyMetric> todayMetricOpt = userMetrics.stream()
                .filter(m -> m.getCreatedAt() != null && m.getCreatedAt().toLocalDate().equals(today))
                .findFirst();

        DailyMetric metric;
        if (todayMetricOpt.isPresent()) {
            metric = todayMetricOpt.get();
        } else {
            metric = DailyMetric.builder()
                    .user(user)
                    .source("DAILY_UPDATE")
                    .build();
        }

        if (request.getSysBP() != null) metric.setSysBP(request.getSysBP());
        if (request.getDiaBP() != null) metric.setDiaBP(request.getDiaBP());

        String bp = request.getBloodPressure();
        if ((bp == null || bp.isEmpty()) && metric.getSysBP() != null && metric.getDiaBP() != null) {
            bp = metric.getSysBP() + "/" + metric.getDiaBP();
        }
        if (bp != null && !bp.isEmpty()) {
            metric.setBloodPressure(bp);
        }

        if (request.getHeartRate() != null) metric.setHeartRate(request.getHeartRate());
        if (request.getSpo2() != null) metric.setSpo2(request.getSpo2());
        if (request.getCholesterol() != null) metric.setCholesterol(request.getCholesterol());
        if (request.getBloodSugar() != null) metric.setBloodSugar(request.getBloodSugar());
        if (request.getWeight() != null) metric.setWeight(request.getWeight());

        dailyMetricRepository.save(metric);
    }

    @Override
    public OverviewResponse getOverview(String email) {
        User user = findUserByIdentifier(email);

        List<DailyMetric> metrics = dailyMetricRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        String bp = findLatestBP(metrics).orElseGet(() -> 
            findLatestHealthRecordBP(user.getId()).orElse("--/--")
        );

        String hr = findLatestHR(metrics).orElseGet(() -> 
            findLatestHealthRecordHR(user.getId()).orElse("--")
        );

        String spo2 = findLatestSpo2(metrics).orElse("--");

        String chol = findLatestCholesterol(metrics).orElseGet(() -> 
            findLatestHealthRecordChol(user.getId()).orElse("--")
        );

        String sugar = findLatestBloodSugar(metrics).orElse("--");

        String weight = findLatestWeight(metrics).orElseGet(() -> 
            findLatestHealthRecordWeight(user.getId()).orElse("--")
        );

        String name = user.getFullName() != null && !user.getFullName().trim().isEmpty() 
                ? user.getFullName() 
                : "bạn";

        String statusSubtitle = "Hôm nay sức khỏe của " + name + " rất ổn định! Hãy tiếp tục duy trì nhé.";

        return OverviewResponse.builder()
                .fullName(user.getFullName() != null ? user.getFullName() : "")
                .statusTitle("Chăm sóc trái tim của bạn.")
                .statusSubtitle(statusSubtitle)
                .bloodPressure(bp)
                .heartRate(hr)
                .spo2(spo2)
                .cholesterol(chol)
                .bloodSugar(sugar)
                .weight(weight)
                .assessmentColor("#16A34A")
                .build();
    }

    private Optional<String> findLatestBP(List<DailyMetric> metrics) {
        for (DailyMetric m : metrics) {
            if (m.getBloodPressure() != null && !m.getBloodPressure().trim().isEmpty()) {
                return Optional.of(m.getBloodPressure());
            }
        }
        return Optional.empty();
    }

    private Optional<String> findLatestHR(List<DailyMetric> metrics) {
        for (DailyMetric m : metrics) {
            if (m.getHeartRate() != null && m.getHeartRate() > 0) {
                return Optional.of(String.valueOf(m.getHeartRate()));
            }
        }
        return Optional.empty();
    }

    private Optional<String> findLatestSpo2(List<DailyMetric> metrics) {
        for (DailyMetric m : metrics) {
            if (m.getSpo2() != null && m.getSpo2() > 0) {
                return Optional.of(String.valueOf(m.getSpo2()));
            }
        }
        return Optional.empty();
    }

    private Optional<String> findLatestCholesterol(List<DailyMetric> metrics) {
        for (DailyMetric m : metrics) {
            if (m.getCholesterol() != null && m.getCholesterol() > 0) {
                return Optional.of(String.valueOf(m.getCholesterol()));
            }
        }
        return Optional.empty();
    }

    private Optional<String> findLatestBloodSugar(List<DailyMetric> metrics) {
        for (DailyMetric m : metrics) {
            if (m.getBloodSugar() != null && m.getBloodSugar() > 0) {
                // format cleanly without trailing zero if integer
                double val = m.getBloodSugar();
                if (val == (long) val) {
                    return Optional.of(String.format("%d", (long) val));
                } else {
                    return Optional.of(String.format("%.1f", val));
                }
            }
        }
        return Optional.empty();
    }

    private Optional<String> findLatestWeight(List<DailyMetric> metrics) {
        for (DailyMetric m : metrics) {
            if (m.getWeight() != null && m.getWeight() > 0) {
                double val = m.getWeight();
                if (val == (long) val) {
                    return Optional.of(String.format("%d", (long) val));
                } else {
                    return Optional.of(String.format("%.1f", val));
                }
            }
        }
        return Optional.empty();
    }

    private Optional<String> findLatestHealthRecordBP(Long userId) {
        List<HealthRecord> records = healthRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (HealthRecord r : records) {
            if (r.getBloodPressure() != null && !r.getBloodPressure().trim().isEmpty()) {
                return Optional.of(r.getBloodPressure());
            }
        }
        return Optional.empty();
    }

    private Optional<String> findLatestHealthRecordHR(Long userId) {
        List<HealthRecord> records = healthRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (HealthRecord r : records) {
            if (r.getHeartRate() != null && r.getHeartRate() > 0) {
                return Optional.of(String.valueOf(r.getHeartRate()));
            }
        }
        return Optional.empty();
    }

    private Optional<String> findLatestHealthRecordChol(Long userId) {
        List<HealthRecord> records = healthRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (HealthRecord r : records) {
            if (r.getCholesterol() != null && r.getCholesterol() > 0) {
                return Optional.of(String.valueOf(r.getCholesterol()));
            }
        }
        return Optional.empty();
    }

    private Optional<String> findLatestHealthRecordWeight(Long userId) {
        List<HealthRecord> records = healthRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (HealthRecord r : records) {
            if (r.getWeight() != null && r.getWeight() > 0) {
                double val = r.getWeight();
                if (val == (long) val) {
                    return Optional.of(String.format("%d", (long) val));
                } else {
                    return Optional.of(String.format("%.1f", val));
                }
            }
        }
        return Optional.empty();
    }

    private HealthAssessmentResponse getAssessment(String chestPain, String breathlessness, 
                                                   int sysBP, int diaBP, int hr, int chol, 
                                                   Integer ageObj, long numComorbidities,
                                                   String lang) {
        boolean isEN = "EN".equalsIgnoreCase(lang);
        int age = ageObj != null ? ageObj : 0;
        String cp = chestPain == null ? "none" : chestPain;
        String br = breathlessness == null ? "none" : breathlessness;

        if (cp.equals("severe") || br.equals("severe") || sysBP > 180 || diaBP > 120) {
            return HealthAssessmentResponse.builder()
                    .title(isEN ? "EMERGENCY RISK" : "NGUY CƠ KHẨN CẤP")
                    .subtitle(isEN 
                        ? "The system detected critical warning signs. Immediate medical intervention is required!"
                        : "Hệ thống phát hiện dấu hiệu cảnh báo nghiêm trọng. Cần can thiệp y tế ngay lập tức!")
                    .icon("warning")
                    .color("#DC2626")
                    .glowBg("#FEE2E2")
                    .glowBorder("#FECACA")
                    .recommendations(isEN ? Arrays.asList(
                            "🚨 Go to the nearest medical facility immediately or call 115 emergency!",
                            "Stop all strenuous activity immediately and rest sitting or lying down.",
                            "If emergency antihypertensive/cardiovascular medication is available, take it immediately.",
                            "Ask family members for help; do not drive yourself under any circumstances."
                    ) : Arrays.asList(
                            "🚨 Đến ngay cơ sở y tế gần nhất hoặc gọi cấp cứu 115!",
                            "Dừng ngay mọi hoạt động gắng sức, ngồi hoặc nằm nghỉ ngơi.",
                            "Nếu có sẵn thuốc cấp cứu hạ áp/tim mạch, hãy sử dụng ngay.",
                            "Nhờ người thân hỗ trợ, tuyệt đối không tự lái xe."
                    )).build();
        }

        if (cp.equals("mild") || br.equals("mild") || sysBP >= 160 || diaBP >= 100 || hr > 110 || numComorbidities >= 3) {
            return HealthAssessmentResponse.builder()
                    .title(isEN ? "HIGH RISK" : "NGUY CƠ CAO")
                    .subtitle(isEN 
                        ? "Your health metrics significantly exceed the safe threshold. Prompt specialist medical consultation is required."
                        : "Các chỉ số của Bác đang vượt ngưỡng an toàn khá nhiều. Cần được bác sĩ chuyên khoa thăm khám sớm.")
                    .icon("warning")
                    .color("#EA580C")
                    .glowBg("#FFEDD5")
                    .glowBorder("#FED7AA")
                    .recommendations(isEN ? Arrays.asList(
                            "Schedule a cardiologist visit soon (within 24 - 48h).",
                            "Re-measure blood pressure after 15 minutes of quiet rest.",
                            "Take medications regularly according to current prescription.",
                            "Adhere strictly to a low-salt diet (under 2g salt/day)."
                    ) : Arrays.asList(
                            "Sắp xếp đi khám bác sĩ chuyên khoa tim mạch sớm (trong vòng 24 - 48h).",
                            "Đo lại huyết áp sau 15 phút nghỉ ngơi hoàn toàn tĩnh lặng.",
                            "Uống thuốc đều đặn theo đúng đơn thuốc hiện tại.",
                            "Tuân thủ chế độ ăn nhạt tuyệt đối (dưới 2g muối/ngày)."
                    )).build();
        }

        if (sysBP >= 140 || diaBP >= 90 || chol > 200 || (age > 60 && numComorbidities >= 1)) {
            return HealthAssessmentResponse.builder()
                    .title(isEN ? "MODERATE RISK" : "NGUY CƠ TRUNG BÌNH")
                    .subtitle(isEN 
                        ? "You belong to the close monitoring group, but there is no acute danger."
                        : "Bác thuộc nhóm cần theo dõi sát sao nhưng chưa có nguy hiểm cấp tính.")
                    .icon("warning")
                    .color("#D97706")
                    .glowBg("#FEF3C7")
                    .glowBorder("#FDE68A")
                    .recommendations(isEN ? Arrays.asList(
                            "Monitor closely and start making lifestyle changes.",
                            "Exercise at light-to-moderate intensity for 30 minutes daily.",
                            "Limit salty foods, cut down on refined carbs and animal fat.",
                            "Self-measure and record blood pressure at home twice a week."
                    ) : Arrays.asList(
                            "Theo dõi sát sao và bắt đầu thay đổi lối sống.",
                            "Tập thể dục cường độ nhẹ đến trung bình 30 phút mỗi ngày.",
                            "Hạn chế ăn mặn, giảm tinh bột và mỡ động vật.",
                            "Tự đo và ghi chép huyết áp tại nhà 2 lần/tuần."
                    )).build();
        }

        return HealthAssessmentResponse.builder()
                .title(isEN ? "NORMAL / LOW RISK" : "BÌNH THƯỜNG / NGUY CƠ THẤP")
                .subtitle(isEN 
                    ? "Your current cardiovascular health status is quite stable!"
                    : "Tình trạng tim mạch hiện tại của Bác khá ổn định!")
                .icon("check-circle")
                .color("#16A34A")
                .glowBg("#DCFCE7")
                .glowBorder("#BBF7D0")
                .recommendations(isEN ? Arrays.asList(
                        "Maintain a healthy, balanced diet.",
                        "Continue regular physical exercise to maintain physical condition.",
                        "Schedule a general health checkup once a year."
                ) : Arrays.asList(
                        "Duy trì chế độ ăn uống cân bằng, lành mạnh.",
                        "Tiếp tục tập thể dục đều đặn để duy trì thể trạng.",
                        "Kiểm tra sức khỏe tổng quát định kỳ mỗi năm 1 lần."
                )).build();
    }

    private static final Map<String, String> COMORBIDITY_MAP = new HashMap<>();
    static {
        COMORBIDITY_MAP.put("hypertension", "Cao huyết áp");
        COMORBIDITY_MAP.put("diabetes", "Đái tháo đường");
        COMORBIDITY_MAP.put("dyslipidemia", "Rối loạn mỡ máu");
        COMORBIDITY_MAP.put("heart_disease", "Bệnh tim mạch");
        COMORBIDITY_MAP.put("heartdisease", "Bệnh tim mạch");
        COMORBIDITY_MAP.put("stroke", "Tai biến / Đột quỵ");
        COMORBIDITY_MAP.put("kidney_disease", "Bệnh thận mãn");
        COMORBIDITY_MAP.put("kidneydisease", "Bệnh thận mãn");
        COMORBIDITY_MAP.put("asthma", "Hen suyễn");
        COMORBIDITY_MAP.put("gout", "Bệnh Gút");
        COMORBIDITY_MAP.put("obesity", "Béo phì");
        COMORBIDITY_MAP.put("arrhythmia", "Rối loạn nhịp tim");
    }

    private String normalizeGender(String gender) {
        if (gender == null || gender.trim().isEmpty()) return "Nam";
        String g = gender.trim().toLowerCase();
        if (g.equals("male") || g.equals("nam") || g.equals("m")) return "Nam";
        if (g.equals("female") || g.equals("nữ") || g.equals("nu") || g.equals("f")) return "Nữ";
        return gender.trim();
    }

    private String translateComorbidities(String raw) {
        if (raw == null || raw.trim().isEmpty()) return "Chưa cập nhật";
        String[] parts = raw.split(",");
        List<String> translated = new ArrayList<>();
        for (String p : parts) {
            String key = p.trim().toLowerCase();
            if (key.startsWith("custom_")) {
                continue;
            }
            if (COMORBIDITY_MAP.containsKey(key)) {
                translated.add(COMORBIDITY_MAP.get(key));
            } else if (!key.isEmpty()) {
                translated.add(p.trim());
            }
        }
        return translated.isEmpty() ? "Chưa cập nhật" : String.join(", ", translated);
    }

    @Override
    public UserProfileResponse getUserProfile(String email) {
        User user = findUserByIdentifier(email);

        Optional<HealthRecord> recordOpt = healthRecordRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());

        String startDate = "--/--/----";
        if (recordOpt.isPresent() && recordOpt.get().getCreatedAt() != null) {
            startDate = recordOpt.get().getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } else if (user.getCreatedAt() != null) {
            startDate = user.getCreatedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }

        String rawComorbidities = "Chưa cập nhật";
        String medications = "Chưa có";
        String assessmentTitle = "Bệnh nhân nguy cơ trung bình";
        String assessmentColor = "#D97706";

        if (recordOpt.isPresent()) {
            HealthRecord record = recordOpt.get();
            if (record.getComorbidities() != null && !record.getComorbidities().trim().isEmpty()) {
                rawComorbidities = record.getComorbidities().trim();
            }
            if (record.getMedications() != null && !record.getMedications().trim().isEmpty()) {
                medications = record.getMedications().trim();
            }
            if (record.getAssessmentTitle() != null && !record.getAssessmentTitle().trim().isEmpty()) {
                assessmentTitle = record.getAssessmentTitle();
            }
            if (record.getAssessmentColor() != null && !record.getAssessmentColor().trim().isEmpty()) {
                assessmentColor = record.getAssessmentColor();
            }
        }

        String comorbidities = translateComorbidities(rawComorbidities);
        boolean isComorbiditiesLong = comorbidities.length() > 12 || comorbidities.contains(",") || rawComorbidities.contains(",");

        Integer age = user.getAge();
        if (age == null && recordOpt.isPresent()) {
            age = recordOpt.get().getAge();
        }

        String rawGender = user.getGender();
        if ((rawGender == null || rawGender.trim().isEmpty()) && recordOpt.isPresent()) {
            rawGender = recordOpt.get().getGender();
        }
        String gender = normalizeGender(rawGender);

        return UserProfileResponse.builder()
                .email(user.getEmail())
                .fullName(user.getFullName() != null ? user.getFullName() : "Bệnh nhân")
                .avatar(user.getAvatar())
                .age(age != null ? age : 65)
                .gender(gender)
                .startDate(startDate)
                .comorbidities(comorbidities)
                .isComorbiditiesLong(isComorbiditiesLong)
                .medications(medications)
                .assessmentTitle(assessmentTitle)
                .assessmentColor(assessmentColor)
                .build();
    }

    @Override
    public UserProfileResponse updateUserProfile(UpdateProfileRequest request) {
        User user = findUserByIdentifier(request.getEmail());

        if (request.getFullName() != null) user.setFullName(request.getFullName().trim());
        if (request.getAge() != null) user.setAge(request.getAge());
        if (request.getGender() != null) user.setGender(normalizeGender(request.getGender()));
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
        userRepository.save(user);

        Optional<HealthRecord> recordOpt = healthRecordRepository.findFirstByUserIdOrderByCreatedAtDesc(user.getId());
        HealthRecord record;
        if (recordOpt.isPresent()) {
            record = recordOpt.get();
        } else {
            record = HealthRecord.builder()
                    .user(user)
                    .age(user.getAge())
                    .gender(user.getGender())
                    .assessmentTitle("Bệnh nhân đã cập nhật hồ sơ")
                    .assessmentColor("#3B82F6")
                    .build();
        }

        if (request.getComorbidities() != null) {
            record.setComorbidities(request.getComorbidities().trim());
        }
        if (request.getMedications() != null) {
            record.setMedications(request.getMedications().trim());
        }
        if (request.getAge() != null) {
            record.setAge(request.getAge());
        }
        if (request.getGender() != null) {
            record.setGender(normalizeGender(request.getGender()));
        }
        healthRecordRepository.save(record);

        return getUserProfile(request.getEmail());
    }

    private int parseSafe(String val) {
        if (val == null || val.trim().isEmpty()) return 0;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
    
    private Double parseSafeDouble(String val) {
        if (val == null || val.trim().isEmpty()) return 0.0;
        try {
            return Double.parseDouble(val.trim());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }

    @Override
    public List<DailyMetricDto> getMetricsHistory(String identifier, int days) {
        User user = findUserByIdentifier(identifier);
        java.time.LocalDateTime startDate = java.time.LocalDateTime.now().minusDays(days);
        List<DailyMetric> metrics = dailyMetricRepository.findByUserIdAndCreatedAtAfterOrderByCreatedAtAsc(user.getId(), startDate);
        
        if (metrics.isEmpty()) {
            metrics = dailyMetricRepository.findByUserIdOrderByCreatedAtAsc(user.getId());
        }

        // Fallback: If still empty, check if user has a HealthRecord to seed an initial metric
        if (metrics.isEmpty()) {
            List<HealthRecord> records = healthRecordRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            if (!records.isEmpty()) {
                HealthRecord record = records.get(0);
                Integer sysBP = null;
                Integer diaBP = null;
                if (record.getBloodPressure() != null && record.getBloodPressure().contains("/")) {
                    try {
                        String[] parts = record.getBloodPressure().split("/");
                        sysBP = Integer.parseInt(parts[0].trim());
                        diaBP = Integer.parseInt(parts[1].trim());
                    } catch (Exception ignored) {}
                }

                DailyMetric seeded = DailyMetric.builder()
                    .user(user)
                    .sysBP(sysBP)
                    .diaBP(diaBP)
                    .bloodPressure(record.getBloodPressure())
                    .heartRate(record.getHeartRate())
                    .cholesterol(record.getCholesterol())
                    .weight(record.getWeight())
                    .source("INITIAL_RECORD")
                    .build();
                seeded = dailyMetricRepository.save(seeded);
                metrics = Collections.singletonList(seeded);
            }
        }

        // Group by day and MERGE all non-null fields for each date
        Map<java.time.LocalDate, DailyMetric> dailyMap = new LinkedHashMap<>();
        for (DailyMetric metric : metrics) {
            if (metric.getCreatedAt() != null) {
                java.time.LocalDate dateKey = metric.getCreatedAt().toLocalDate();
                if (!dailyMap.containsKey(dateKey)) {
                    DailyMetric copy = DailyMetric.builder()
                        .user(user)
                        .sysBP(metric.getSysBP())
                        .diaBP(metric.getDiaBP())
                        .bloodPressure(metric.getBloodPressure())
                        .heartRate(metric.getHeartRate())
                        .spo2(metric.getSpo2())
                        .cholesterol(metric.getCholesterol())
                        .bloodSugar(metric.getBloodSugar())
                        .weight(metric.getWeight())
                        .source(metric.getSource())
                        .createdAt(metric.getCreatedAt())
                        .build();
                    dailyMap.put(dateKey, copy);
                } else {
                    DailyMetric existing = dailyMap.get(dateKey);
                    if (metric.getSysBP() != null) existing.setSysBP(metric.getSysBP());
                    if (metric.getDiaBP() != null) existing.setDiaBP(metric.getDiaBP());
                    if (metric.getBloodPressure() != null) existing.setBloodPressure(metric.getBloodPressure());
                    if (metric.getHeartRate() != null) existing.setHeartRate(metric.getHeartRate());
                    if (metric.getSpo2() != null) existing.setSpo2(metric.getSpo2());
                    if (metric.getCholesterol() != null) existing.setCholesterol(metric.getCholesterol());
                    if (metric.getBloodSugar() != null) existing.setBloodSugar(metric.getBloodSugar());
                    if (metric.getWeight() != null) existing.setWeight(metric.getWeight());
                    existing.setCreatedAt(metric.getCreatedAt());
                }
            }
        }
        
        List<DailyMetricDto> result = new ArrayList<>();
        for (DailyMetric metric : dailyMap.values()) {
            DailyMetricDto dto = DailyMetricDto.builder()
                .sysBP(metric.getSysBP())
                .diaBP(metric.getDiaBP())
                .heartRate(metric.getHeartRate())
                .weight(metric.getWeight())
                .bloodSugar(metric.getBloodSugar())
                .cholesterol(metric.getCholesterol())
                .spo2(metric.getSpo2())
                .date(metric.getCreatedAt())
                .build();
            result.add(dto);
        }
        return result;
    }
}
