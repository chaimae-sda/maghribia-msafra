# Deployment Checklist - Maghribia Msafra Performance Fixes

## Pre-Deployment

- [ ] **Create Supabase Backup**
  - Go to: Supabase Dashboard → Database Settings → Backups
  - Click "Request backup" to create a backup before running migrations
  
- [ ] **Verify All Code Changes**
  - [ ] `src/app/(main)/messages/page.js` - Updated fetchConversations() and fetchMessages()
  - [ ] `src/app/(main)/voyages/page.js` - Optimized queries with separate agency/girls fetching
  - [ ] `src/app/(main)/sorties/page.js` - Added database filtering
  - [ ] `supabase-migration.sql` - Complete schema with indexes

- [ ] **Test Locally (if available)**
  ```bash
  npm run dev
  # Test each page loads in acceptable time
  ```

## Deployment Steps

### Step 1: Deploy Database Changes
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy entire content from `supabase-migration.sql`
4. Paste into SQL Editor
5. Click "Run" button
6. Wait for all statements to complete (should take 2-3 minutes)
7. Verify no errors in the output

### Step 2: Deploy Code Changes
```bash
# From project root directory
git add supabase-migration.sql PERFORMANCE_FIXES.md src/app/(main)/messages/page.js src/app/(main)/voyages/page.js src/app/(main)/sorties/page.js

git commit -m "feat: optimize database queries and add pagination
- Add 25+ performance indexes to Supabase
- Optimize messages page: reduce N+1 queries, add pagination
- Optimize voyages page: filter at DB level, add limits
- Optimize sorties page: add DB filtering
- Estimated performance improvement: 60-80%"

git push origin main
```

### Step 3: Verify Deployment
1. Wait 1-2 minutes for code to be deployed
2. Clear browser cache (Ctrl+Shift+Delete)
3. Test each page:
   - [ ] Voyages page loads in < 2 seconds
   - [ ] Sorties page loads in < 2 seconds  
   - [ ] Messages page loads in < 2 seconds
   - [ ] Message conversation opens in < 1 second
   - [ ] Can send/receive messages without delay

### Step 4: Monitor
1. Check Supabase Analytics
   - Go to: Database → Performance → Insights
   - Verify query times have decreased
   - Check for any slow queries

2. Monitor error logs
   - Go to: Logs → API Errors
   - Verify no new errors introduced

## Rollback Instructions (if needed)

If there are issues after deployment, rollback by:

### Quick Rollback (Code Only)
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Full Rollback (Database + Code)
1. **Restore from Backup**
   - Supabase Dashboard → Database Settings → Backups
   - Restore from the backup created before deployment

2. **Revert Code**
   ```bash
   git revert HEAD
   git push origin main
   ```

## Performance Metrics to Track

After deployment, monitor these metrics:

| Metric | Target | How to Check |
|--------|--------|-------------|
| Voyages page load time | < 2s | Open page, check Network tab |
| Messages page load time | < 2s | Open page, check Network tab |
| Sorties page load time | < 2s | Open page, check Network tab |
| Message send latency | < 500ms | Send message, check timestamp |
| Database connection pool | < 10 active | Supabase → Database → Connections |
| Slow queries count | 0 | Supabase → Logs → API Errors |

## Testing Checklist

### Voyages Page
- [ ] Page loads in < 2 seconds
- [ ] Agencies tab shows only agency trips
- [ ] Girls tab shows only non-agency trips with price > 0
- [ ] Can click on trip to see details
- [ ] Can book a trip (for authenticated users)

### Sorties Page
- [ ] Page loads in < 2 seconds
- [ ] Shows only free trips (price = 0)
- [ ] Shows only non-agency trips
- [ ] Can click "Rejoindre le groupe" button

### Messages Page
- [ ] Conversation list loads in < 2 seconds
- [ ] List shows only conversations (no old message threads)
- [ ] Clicking conversation loads messages in < 1 second
- [ ] Can send message immediately (< 500ms)
- [ ] Receiving messages updates in real-time

## Support

If issues occur after deployment:
1. Check PERFORMANCE_FIXES.md for detailed documentation
2. Review the Supabase logs for database errors
3. Check browser console for JavaScript errors
4. Use the rollback instructions above if needed

---

**Deployment Date:** [To be filled in]  
**Deployed By:** [Team member name]  
**Status:** Ready for Deployment ✅
