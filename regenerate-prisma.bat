@echo off
echo Stopping any Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Deleting Prisma client...
rmdir /s /q node_modules\.prisma 2>nul

echo Regenerating Prisma client...
npx prisma generate

echo Done! You can now restart your dev server with: npm run dev
pause
