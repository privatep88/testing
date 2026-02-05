
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto py-6 border-t border-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-400 gap-2">
          <p>© {currentYear} SAHER For Smart Services. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
              <span>اعداد وتصميم: خالد الجفري</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <a href="#" className="hover:text-blue-600 transition-colors">الدعم الفني</a>
          </div>
      </div>
    </footer>
  );
};

export default Footer;
