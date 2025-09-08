# Hotjar Deployment Checklist

## Pre-Deployment Verification

### ✅ Code Implementation
- [x] Hotjar tracking code added to `frontend/src/index.html`
- [x] Hotjar ID `6497330` configured correctly
- [x] App component tracking methods implemented
- [x] All component integrations completed
- [x] Helper methods added to components

### ✅ Files Modified
- [x] `frontend/src/index.html` - Hotjar tracking code
- [x] `frontend/src/app/app.component.ts` - Tracking methods
- [x] `frontend/src/app/componet/login/login.component.ts` - Login tracking
- [x] `frontend/src/app/componet/register/register.component.ts` - Registration tracking
- [x] `frontend/src/app/componet/batch-upload.component.ts` - Upload tracking
- [x] `frontend/src/app/componet/download/download.component.ts` - Download tracking
- [x] `frontend/src/app/componet/home/home.component.ts` - Homepage tracking

## Deployment Steps

### 1. Build and Deploy
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Deploy to your hosting platform
# (Vercel, Netlify, or your preferred hosting)
```

### 2. Verify Hotjar Installation
1. **Visit your website** after deployment
2. **Open browser developer tools** (F12)
3. **Check Console** for any Hotjar errors
4. **Check Network tab** for Hotjar script loading
5. **Verify Hotjar ID** in the loaded script

### 3. Test Tracking Events
1. **Visit homepage** - Should trigger `homepage_viewed`
2. **Navigate to login page** - Should trigger `login_page_viewed`
3. **Try to register** - Should trigger registration events
4. **Try to upload a file** - Should trigger upload events
5. **Try to download a file** - Should trigger download events

### 4. Hotjar Dashboard Verification
1. **Login to Hotjar dashboard**
2. **Check Site Settings** - Verify site URL and Hotjar ID
3. **Check Recordings** - Should see new recordings within 24 hours
4. **Check Heatmaps** - Should generate heatmaps for visited pages
5. **Check Events** - Should see custom events being tracked

## Post-Deployment Monitoring

### Week 1: Initial Data Collection
- [ ] **Day 1-2:** Verify tracking is working
- [ ] **Day 3-4:** Check first recordings and heatmaps
- [ ] **Day 5-7:** Review initial event data
- [ ] **End of Week:** Create baseline metrics

### Week 2: Analysis Setup
- [ ] **Set up conversion funnels**
- [ ] **Create custom dashboards**
- [ ] **Configure alerts**
- [ ] **Identify initial insights**

### Week 3: Optimization Planning
- [ ] **Review user behavior patterns**
- [ ] **Identify pain points**
- [ ] **Plan A/B tests**
- [ ] **Prioritize improvements**

## Troubleshooting

### Common Issues

#### 1. Hotjar Not Loading
**Symptoms:** No Hotjar script in Network tab
**Solutions:**
- Check if Hotjar ID is correct
- Verify script is in `<head>` section
- Check for JavaScript errors in console
- Ensure website is accessible

#### 2. Events Not Tracking
**Symptoms:** No custom events in Hotjar dashboard
**Solutions:**
- Verify `trackHotjarEvent` method is called
- Check for JavaScript errors
- Ensure Hotjar script loaded before events
- Test with simple event first

#### 3. Page Views Not Tracking
**Symptoms:** No page view recordings
**Solutions:**
- Check route change tracking
- Verify `stateChange` method is called
- Ensure SPA navigation is handled
- Test with direct URL visits

### Debug Commands
```javascript
// Test Hotjar is loaded
console.log('Hotjar loaded:', typeof window.hj !== 'undefined');

// Test event tracking
window.hj('event', 'test_event', { test: true });

// Check Hotjar settings
console.log('Hotjar ID:', window._hjSettings?.hjid);
```

## Success Metrics

### Week 1 Targets
- [ ] **100+ page views tracked**
- [ ] **10+ user recordings captured**
- [ ] **5+ custom events triggered**
- [ ] **No JavaScript errors**

### Week 2 Targets
- [ ] **500+ page views tracked**
- [ ] **50+ user recordings captured**
- [ ] **All custom events working**
- [ ] **First insights identified**

### Week 3 Targets
- [ ] **1000+ page views tracked**
- [ ] **100+ user recordings captured**
- [ ] **Conversion funnels set up**
- [ ] **Optimization plan created**

## Contact Information

**For Technical Issues:**
- Check implementation code in modified files
- Review browser console for errors
- Test with Hotjar's debugging tools

**For Hotjar Support:**
- [Hotjar Help Center](https://help.hotjar.com/)
- [Hotjar Community](https://community.hotjar.com/)

**Implementation Details:**
- **Hotjar ID:** 6497330
- **Website:** https://www.mfcnextgen.com/
- **Implementation Date:** [Current Date]
- **Status:** Ready for Deployment

---

**Next Review Date:** [1 week from deployment]
**Review Items:** Data collection progress, tracking accuracy, initial insights
