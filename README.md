# Tab Moein (تب معین) 🚀

<p align="center">
  <img src="icon128.png" alt="Tab Moein Logo" width="96" height="96">
</p>

<p align="center">
  <b>افزونه سفارشی‌سازی مدرن صفحه گوگل و زبانه جدید (New Tab) برای گوگل کروم</b><br>
  <i>Modern Frosted-Glass Google Homepage & New Tab Customizer for Google Chrome</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-4285F4?style=flat-square&logo=google-chrome" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Version-3.12.0-34A853?style=flat-square" alt="Version 3.12.0">
  <img src="https://img.shields.io/badge/License-MIT-FBBC05?style=flat-square" alt="License MIT">
  <img src="https://img.shields.io/badge/RTL-Supported-EA4335?style=flat-square" alt="RTL Supported">
</p>

---

## 🌟 ویژگی‌های کلیدی (Key Features)

- 🎨 **طراحی مدرن شیشه‌ای (Frosted Glass UI)**: طراحی شفاف و بلورین مطابق با آخرین استانداردهای طراحی وب با افکت مات‌کننده شیشه‌ای (`backdrop-filter`).
- 🧭 **سربرگ یکپارچه (Unified Header Bar)**: ادغام لوگوی گوگل، فیلد جستجو و دسترسی ۲×۲ به حساب کاربری، جیمیل، تصاویر و اپ‌های گوگل در یک خط افقی متقارن.
- 📁 **مدیریت پوشه‌های نشانک‌ها (Bookmark Folders Grid)**: نمایش تا ۱۲ پوشه دسته‌بندی‌شده از سایت‌های مورد علاقه در یک شبکه منظم ۴ ستونه.
- 🔀 **جابجایی با کشیدن و رها کردن (Drag and Drop)**:
  - جابجایی ترتیبی پوشه‌ها با استفاده از دستگیره گریپ ۶ نقطه‌ای (`⋮⋮`).
  - جابجایی آزاد نشانک‌ها درون یک پوشه یا انتقال بین پوشه‌های مختلف.
- 🎨 **پالت رنگ هوشمند (Color Wheel & Presets)**: انتخاب رنگ پس‌زمینه اختصاصی برای هر پوشه با چرخه رنگی HSL و رنگ‌های از پیش تعیین‌شده ملایم.
- 🔖 **اتصال به نشانک‌های گوگل کروم (Chrome Bookmarks Integration)**: امکان انتخاب و وارد کردن پوشه‌ها یا نشانک‌های مرورگر کروم به صورت مستقیم با تیک زدن.
- 📶 **پشتیبانی کامل از حالت آفلاین (Smart Offline Mode)**:
  - بارگذاری محلی تمام پوشه‌ها و نشانک‌ها حتی در زمان قطعی کامل اینترنت.
  - نمایش پیام انگلیسی وضعیت شبکه (`No internet connection`) در کادر میانی سربرگ.
  - سیستم بررسی خودکار اتصال هر ۲ ثانیه (تا سقف ۲۵ تلاش) و بازگشت خودکار به گوگل به محض وصل شدن اینترنت.
- 📐 **طراحی واکنش‌گرا و سازگار با دو ردیف**: چیدمان خودکار ۲ یا ۳ ستونه نشانک‌ها بسته به عرض صفحه و حذف کامل نوار اسکرول در کارت‌هایی که در ۲ ردیف جا می‌گیرند.

---

## 💻 نحوه نصب و استفاده (Installation Guide)

1. این مخزن را دانلود کنید یا با دستور زیر کلون نمایید:
   ```bash
   git clone https://github.com/moeindavarzani/tab-moein.git
   ```
2. مرورگر **Google Chrome** را باز کرده و به آدرس زیر بروید:
   ```text
   chrome://extensions
   ```
3. گزینه **Developer mode (حالت برنامه‌نویس)** را در گوشه بالا سمت راست فعال کنید.
4. روی دکمه **Load unpacked (بارگذاری بسته بازنشده)** کلیک کنید.
5. پوشه پروژه (`Tab Moein`) را انتخاب کنید.
6. یک زبانه جدید (`Ctrl + T`) باز کنید و از صفحه جدید و شخصی‌سازی‌شده خود لذت ببرید!

---

## 🏗️ ساختار پروژه (Project Structure)

```text
Tab Moein/
├── manifest.json       # مانیفست افزونه (Manifest V3) با دسترسی‌های tabs, bookmarks, storage, webNavigation
├── newtab.html         # صفحه زبانه جدید و میزبان رابط کاربری آفلاین
├── redirect.js         # کنترل‌کننده هوشمند هدایت آنلاین / بارگذاری آفلاین
├── background.js       # سرویس ورکر پس‌زمینه، دسترسی به نشانک‌های کروم و مدیریت خطاهای شبکه
├── google_custom.js    # هسته منطقی رابط کاربری، رندرینگ پوشه‌ها، مودال‌ها، پالت رنگ و درگ اند دراپ
├── google_custom.css   # استایل‌های شیشه‌ای، چیدمان واکنش‌گرا و انیمیشن‌های نرم
├── icon128.png         # آیکون رسمی افزونه
├── test_logic.js       # تست‌های واحد منطقی و اجرای تست‌های مرورگر هدلس
└── test_runner.html    # مجموعه آزمون‌های ۲۵ گانه خودکار DOM در مرورگر هدلس کروم
```

---

## 🧪 تست‌های خودکار (Automated Testing)

برای اجرای تمامی آزمون‌های منطقی و تست‌های DOM در مرورگر هدلس:

```bash
node test_logic.js
```

تمامی ۱۵ بخش آزمون شامل ۲۵ تست مستقل در Headless Chrome با موفقیت ۱۰۰٪ پاس می‌شوند.

---

## 📄 لایسنس (License)

این پروژه تحت مجوز [MIT](LICENSE) منتشر شده است.
