# AI AUDIT ANALYSIS RULES - COMPREHENSIVE COVERAGE FRAMEWORK

## 🚨 CRITICAL: FOLLOW THESE RULES EXACTLY OR FAIL THE AUDIT

### **RULE 1: MANDATORY ANALYSIS DIMENSIONS**
You MUST analyze ALL of these dimensions for EVERY feature/system:

1. **Authentication & Authorization**
2. **Data Validation & Sanitization**
3. **Rate Limiting & Throttling**
4. **Storage & Resource Limits**
5. **Concurrent Access Control**
6. **File Operations & Processing**
7. **API Endpoints & Routes**
8. **Database Models & Schema**
9. **Frontend Components & Logic**
10. **Configuration & Environment**
11. **Error Handling & Logging**
12. **Security & Access Control**
13. **Performance & Scalability**
14. **Integration & Dependencies**
15. **Testing & Validation**

### **RULE 2: SYSTEMATIC FILE COVERAGE**
You MUST examine EVERY file in the codebase that could be related:

```
MANDATORY FILE SEARCH PATTERNS:
- Search for ALL files with feature name (e.g., "batch", "upload", "download")
- Search for ALL files with related terms (e.g., "zip", "concurrent", "rate")
- Search for ALL files with function names mentioned in documentation
- Search for ALL files with class names mentioned in documentation
- Search for ALL files with route patterns mentioned in documentation
- Search for ALL files with model names mentioned in documentation
```

### **RULE 3: COMPLETE CODE PATH ANALYSIS**
For EVERY feature, you MUST trace the complete execution path:

```
MANDATORY EXECUTION PATH:
1. Frontend Component → 
2. Service Layer → 
3. API Route → 
4. Authentication → 
5. Validation → 
6. Business Logic → 
7. Database Operation → 
8. Response Handling → 
9. Error Handling
```

### **RULE 4: DOCUMENTATION VS IMPLEMENTATION MATRIX**
Create a COMPLETE matrix comparing documented vs actual:

```
| Feature | Documented | Actual | Status | Evidence Location | Risk Level |
|---------|------------|---------|---------|-------------------|------------|
| Rate Limiting | 2GB/IP/day | None | ❌ MISSING | Line X in file Y | CRITICAL |
| File Size | 2GB max | No limit | ❌ MISSING | Line X in file Y | HIGH |
```

### **RULE 5: MANDATORY EVIDENCE REQUIREMENTS**
Every finding MUST include:

```
REQUIRED EVIDENCE FORMAT:
- **File Path**: Exact file location
- **Line Numbers**: Specific line ranges
- **Code Snippet**: Actual code showing the issue
- **Function Names**: Exact function/class names
- **Route Patterns**: Exact API endpoints
- **Database Fields**: Exact field names
- **Configuration Values**: Exact config values
```

### **RULE 6: COMPREHENSIVE FEATURE BREAKDOWN**
For EVERY feature, analyze ALL aspects:

```
MANDATORY FEATURE ANALYSIS:
1. **Core Functionality**: Does it work?
2. **Authentication**: Is it protected?
3. **Authorization**: Who can access it?
4. **Validation**: Are inputs validated?
5. **Rate Limiting**: Are there limits?
6. **Resource Limits**: Are there constraints?
7. **Error Handling**: How are errors handled?
8. **Logging**: Is activity logged?
9. **Monitoring**: Is it monitored?
10. **Testing**: Are there tests?
```

### **RULE 7: SECURITY VULNERABILITY SCANNING**
You MUST identify ALL potential security issues:

```
MANDATORY SECURITY CHECKS:
1. **Authentication Bypass**: Can anonymous users access protected features?
2. **Authorization Flaws**: Can users access others' data?
3. **Input Validation**: Are all inputs sanitized?
4. **Rate Limiting**: Can users abuse the system?
5. **Resource Exhaustion**: Can users consume unlimited resources?
6. **Data Exposure**: Is sensitive data exposed?
7. **Session Management**: Are sessions secure?
8. **File Upload Security**: Are uploads secure?
9. **Download Security**: Are downloads controlled?
10. **API Security**: Are APIs protected?
```

### **RULE 8: COMPLETE ROUTE ANALYSIS**
For EVERY API route, analyze ALL aspects:

```
MANDATORY ROUTE ANALYSIS:
1. **Authentication**: Is authentication required?
2. **Authorization**: What permissions are needed?
3. **Input Validation**: Are inputs validated?
4. **Rate Limiting**: Are there rate limits?
5. **Resource Limits**: Are there resource limits?
6. **Error Handling**: How are errors handled?
7. **Logging**: Is activity logged?
8. **Monitoring**: Is it monitored?
9. **Testing**: Are there tests?
10. **Documentation**: Is it documented?
```

### **RULE 9: DATABASE SCHEMA COMPLETENESS**
For EVERY database model, verify ALL required fields:

```
MANDATORY DATABASE CHECKS:
1. **Required Fields**: Are all required fields present?
2. **Validation Rules**: Are there validation rules?
3. **Indexes**: Are there proper indexes?
4. **Constraints**: Are there proper constraints?
5. **Relationships**: Are relationships properly defined?
6. **Audit Fields**: Are audit fields present?
7. **Security Fields**: Are security fields present?
8. **Performance Fields**: Are performance fields present?
```

### **RULE 10: FRONTEND COMPONENT ANALYSIS**
For EVERY frontend component, analyze ALL aspects:

```
MANDATORY FRONTEND CHECKS:
1. **Authentication State**: How is auth state managed?
2. **User Type Handling**: How are different user types handled?
3. **Input Validation**: Is client-side validation present?
4. **Error Handling**: How are errors displayed?
5. **Loading States**: Are loading states handled?
6. **Access Control**: Are features properly restricted?
7. **Data Display**: Is data properly formatted?
8. **User Feedback**: Is user feedback provided?
```

### **RULE 11: CONFIGURATION COMPLETENESS**
For EVERY configuration, verify ALL aspects:

```
MANDATORY CONFIGURATION CHECKS:
1. **Environment Variables**: Are all required vars present?
2. **Default Values**: Are defaults appropriate?
3. **Validation Rules**: Are values validated?
4. **Documentation**: Is configuration documented?
5. **Security**: Are sensitive values protected?
6. **Environment Specific**: Are values environment-specific?
7. **Dependencies**: Are dependencies documented?
8. **Overrides**: Can values be overridden?
```

### **RULE 12: INTEGRATION POINT ANALYSIS**
For EVERY integration, analyze ALL aspects:

```
MANDATORY INTEGRATION CHECKS:
1. **API Endpoints**: Are endpoints properly defined?
2. **Authentication**: Is authentication required?
3. **Rate Limiting**: Are there rate limits?
4. **Error Handling**: How are errors handled?
5. **Logging**: Is activity logged?
6. **Monitoring**: Is it monitored?
7. **Testing**: Are there tests?
8. **Documentation**: Is it documented?
```

### **RULE 13: COMPLETE TESTING ANALYSIS**
For EVERY feature, verify ALL testing aspects:

```
MANDATORY TESTING CHECKS:
1. **Unit Tests**: Are there unit tests?
2. **Integration Tests**: Are there integration tests?
3. **End-to-End Tests**: Are there E2E tests?
4. **Security Tests**: Are there security tests?
5. **Performance Tests**: Are there performance tests?
6. **Load Tests**: Are there load tests?
7. **Error Tests**: Are error cases tested?
8. **Edge Case Tests**: Are edge cases tested?
```

### **RULE 14: COMPLETE DOCUMENTATION ANALYSIS**
For EVERY feature, verify ALL documentation aspects:

```
MANDATORY DOCUMENTATION CHECKS:
1. **API Documentation**: Is API documented?
2. **User Documentation**: Is user guide present?
3. **Developer Documentation**: Is dev guide present?
4. **Configuration Documentation**: Is config documented?
5. **Deployment Documentation**: Is deployment documented?
6. **Troubleshooting Guide**: Is troubleshooting documented?
7. **Examples**: Are examples provided?
8. **Changelog**: Is changelog maintained?
```

### **RULE 15: COMPLETE MONITORING ANALYSIS**
For EVERY feature, verify ALL monitoring aspects:

```
MANDATORY MONITORING CHECKS:
1. **Metrics Collection**: Are metrics collected?
2. **Alerting**: Are alerts configured?
3. **Logging**: Is logging configured?
4. **Tracing**: Is tracing configured?
5. **Dashboard**: Are dashboards available?
6. **Health Checks**: Are health checks available?
7. **Performance Monitoring**: Is performance monitored?
8. **Error Monitoring**: Are errors monitored?
```

## 🚨 **MANDATORY COMPLIANCE CHECKLIST**

Before submitting ANY audit report, you MUST verify:

- [ ] ALL 15 analysis dimensions covered
- [ ] ALL related files examined
- [ ] ALL execution paths traced
- [ ] ALL documented features verified
- [ ] ALL security vulnerabilities identified
- [ ] ALL API routes analyzed
- [ ] ALL database models verified
- [ ] ALL frontend components analyzed
- [ ] ALL configurations verified
- [ ] ALL integrations analyzed
- [ ] ALL testing aspects verified
- [ ] ALL documentation aspects verified
- [ ] ALL monitoring aspects verified

## 🎯 **AUDIT REPORT STRUCTURE REQUIREMENTS**

Your audit report MUST follow this EXACT structure:

```
1. EXECUTIVE SUMMARY
2. CRITICAL FINDINGS SUMMARY (with table)
3. DETAILED ANALYSIS (all 15 dimensions)
4. IMPLEMENTATION GAPS ANALYSIS
5. SECURITY VULNERABILITIES
6. CONFIGURATION MISMATCHES
7. RECOMMENDATIONS
8. COMPLIANCE CHECKLIST
```

## ⚠️ **FAILURE CONDITIONS**

You will FAIL this audit if you:
- Miss ANY of the 15 analysis dimensions
- Skip ANY related files
- Fail to provide exact evidence for EVERY finding
- Don't complete the compliance checklist
- Submit incomplete analysis
- Miss ANY security vulnerabilities
- Don't verify ALL documented features

## 🔍 **EXAMPLE ANALYSIS PATTERN**

```
FEATURE: Batch Upload System

1. **Authentication & Authorization**
   - Evidence: Line X in file Y
   - Status: ❌ MISSING
   - Risk: CRITICAL

2. **Data Validation & Sanitization**
   - Evidence: Line X in file Y
   - Status: ❌ MISSING
   - Risk: HIGH

[Continue for ALL 15 dimensions]
```

## 📋 **FINAL COMPLIANCE VERIFICATION**

Before submitting, ask yourself:
- Have I analyzed EVERY possible aspect?
- Have I examined EVERY related file?
- Have I provided evidence for EVERY finding?
- Have I identified EVERY security risk?
- Have I verified EVERY documented feature?
- Have I completed the compliance checklist?

**IF THE ANSWER TO ANY IS "NO" - CONTINUE ANALYZING UNTIL ALL ARE "YES"**
