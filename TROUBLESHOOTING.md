# Troubleshooting Guide

## Issues and Solutions

### 1. @emotion/react Multiple Instances Warning

**Problem**: You see warnings like "You are loading @emotion/react when it is already loaded. Running multiple instances may cause problems."

**Causes**:
- Multiple versions of @emotion/react in node_modules
- Vite dependency optimization issues
- Hot module replacement creating duplicates

**Solutions**:

1. **Quick Fix**: Clear Vite cache
   ```bash
   npm run clean
   npm run dev
   ```

2. **Complete Fix**: Clear everything and reinstall
   ```bash
   npm run clean:all
   npm run dev
   ```

3. **Diagnose the issue**:
   ```bash
   npm run diagnose:emotion
   ```

### 2. "Cannot convert object to primitive value" Error

**Problem**: React lazy loading fails with this error, causing components to crash.

**Causes**:
- Invalid data being passed to React components
- API responses with unexpected formats
- Objects that can't be stringified used as keys

**Solutions**:

1. **Enhanced Error Boundaries**: The app now includes error boundaries around lazy-loaded components
2. **Better Data Validation**: API responses are now properly validated and sanitized
3. **Safe Component Loading**: Components are wrapped with error boundaries

### 3. Component Loading Issues

**Problem**: Components like ProjectList fail to load properly.

**Causes**:
- API response format mismatches
- Missing or invalid data in responses
- React context issues

**Solutions**:

1. **API Response Handling**: Fixed in `src/services/api.js`
2. **Data Validation**: Enhanced in `src/hooks/useProjects.js`
3. **Error Boundaries**: Added to `src/App.jsx`

## Prevention

### Development Best Practices

1. **Always validate API responses** before using them in components
2. **Use error boundaries** around lazy-loaded components
3. **Clear cache regularly** when experiencing dependency issues
4. **Check console for warnings** about multiple package instances

### Code Quality

1. **Data Validation**: Always check data types and structure
2. **Error Handling**: Wrap async operations in try-catch blocks
3. **Type Safety**: Consider using TypeScript for better type checking

## Debugging Steps

### When Issues Occur

1. **Check the console** for specific error messages
2. **Run the diagnostic tool**: `npm run diagnose:emotion`
3. **Clear caches**: `npm run clean:all`
4. **Check network tab** for API response issues
5. **Verify backend health**: Check if the backend is running and accessible

### Common Debugging Commands

```bash
# Clear all caches and reinstall
npm run clean:all

# Diagnose emotion issues
npm run diagnose:emotion

# Check for linting issues
npm run lint

# Run tests
npm test

# Build for production
npm run build
```

## Performance Optimizations

### Vite Configuration

The Vite config has been optimized to:
- Prevent multiple @emotion instances
- Improve dependency deduplication
- Reduce chunk splitting in development
- Optimize hot module replacement

### API Optimizations

- Request deduplication
- Response caching
- Better error handling
- Timeout management

## Backend Integration

### API Response Format

The backend should return responses in this format:
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

The frontend now properly handles both this format and direct array responses.

### Health Checks

The app includes health checks to ensure backend connectivity:
- Automatic server status monitoring
- Graceful offline handling
- Connection recovery

## Support

If issues persist after trying these solutions:

1. Check the browser console for detailed error messages
2. Verify the backend is running and accessible
3. Clear all caches and reinstall dependencies
4. Check for network connectivity issues
5. Review the API response format in the network tab
