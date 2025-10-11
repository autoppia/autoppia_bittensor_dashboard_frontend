# Runtime Error Fix - useScrollableSlider Hook

## Issue Description

**Error**: `Cannot read properties of null (reading 'classList')`  
**Location**: `packages/isomorphic-core/src/hooks/use-scrollable-slider.ts:26`  
**Component**: `RoundResult` → `Round` → `Page`  

## Root Cause

The `useScrollableSlider` hook was trying to access `classList` on DOM elements that could be `null` during the initial render phase. This happened because:

1. **Timing Issue**: The `useEffect` was running before the DOM elements were fully mounted
2. **Missing Null Checks**: No validation to ensure elements exist before accessing their properties
3. **Event Listener Cleanup**: Potential errors when removing event listeners on null elements

## 🔧 Fix Applied

### **1. Added Null Checks in useEffect**
```typescript
useEffect(() => {
  const filterBarEl = sliderEl.current;
  const prevBtn = sliderPrevBtn.current;
  const nextBtn = sliderNextBtn.current;
  
  // Check if elements exist before proceeding
  if (!filterBarEl || !prevBtn || !nextBtn) {
    return;
  }
  
  // ... rest of the code
}, []);
```

### **2. Protected Scroll Functions**
```typescript
function scrollToTheRight() {
  if (!sliderEl.current || !sliderPrevBtn.current) return;
  
  let offsetWidth = sliderEl.current.offsetWidth;
  sliderEl.current.scrollLeft += offsetWidth / 2;
  sliderPrevBtn.current.classList.remove('opacity-0', 'invisible');
}

function scrollToTheLeft() {
  if (!sliderEl.current || !sliderNextBtn.current) return;
  
  let offsetWidth = sliderEl.current.offsetWidth;
  sliderEl.current.scrollLeft -= offsetWidth / 2;
  sliderNextBtn.current.classList.remove('opacity-0', 'invisible');
}
```

### **3. Safe Event Listener Cleanup**
```typescript
return () => {
  window.removeEventListener('resize', initNextPrevBtnVisibility);
  if (filterBarEl) {
    filterBarEl.removeEventListener('scroll', visibleNextAndPrevBtnOnScroll);
  }
};
```

## ✅ Benefits

### **Error Prevention**
- **Null Safety**: Prevents runtime errors when DOM elements are not yet mounted
- **Graceful Degradation**: Hook returns early if elements don't exist
- **Event Safety**: Safe event listener cleanup prevents memory leaks

### **Better User Experience**
- **No More Crashes**: Application doesn't crash on initial load
- **Smooth Loading**: Components load without runtime errors
- **Stable Performance**: Consistent behavior across different loading states

### **Code Quality**
- **Defensive Programming**: Added proper null checks
- **Type Safety**: Better handling of potentially null references
- **Maintainability**: More robust code that handles edge cases

## 🧪 Testing

### **Before Fix**
- ❌ Runtime error on `/rounds/20`
- ❌ Application crash with "Something went wrong!"
- ❌ Error in browser console

### **After Fix**
- ✅ Page loads successfully
- ✅ No runtime errors
- ✅ Smooth user experience
- ✅ All functionality works as expected

## 📋 Prevention Guidelines

### **1. Always Check for Null**
```typescript
// ❌ Bad
element.classList.add('class');

// ✅ Good
if (element) {
  element.classList.add('class');
}
```

### **2. Use Optional Chaining**
```typescript
// ✅ Better
element?.classList?.add('class');
```

### **3. Early Returns**
```typescript
// ✅ Best
if (!element) return;
element.classList.add('class');
```

### **4. useEffect Safety**
```typescript
useEffect(() => {
  // Check if refs are available
  if (!ref.current) return;
  
  // Safe to use ref.current
}, []);
```

## 🔍 Related Components

This fix affects components that use the `useScrollableSlider` hook:
- `RoundValidators`
- `RoundResult`
- Any component with horizontal scrolling

## 📝 Future Improvements

### **Consider Adding**
1. **Loading States**: Show loading indicators while elements mount
2. **Error Boundaries**: Catch and handle similar errors gracefully
3. **TypeScript Strict Mode**: Enable stricter null checks
4. **Unit Tests**: Test hook behavior with null elements

---

**Fixed**: January 2024  
**Status**: ✅ Resolved  
**Impact**: High - Prevents application crashes
