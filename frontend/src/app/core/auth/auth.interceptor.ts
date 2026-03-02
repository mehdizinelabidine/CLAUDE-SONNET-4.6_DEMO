import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const mockUserId = localStorage.getItem('mock_user_id');

  if (mockUserId) {
    const modified = req.clone({
      setHeaders: { 'x-mock-user-id': mockUserId },
    });
    return next(modified);
  }

  // In Clerk mode the token would be injected here from Clerk SDK
  const token = localStorage.getItem('clerk_token');
  if (token) {
    const modified = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(modified);
  }

  return next(req);
};
