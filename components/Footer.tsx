import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent mt-8">
      <div className="container mx-auto py-6 px-8 text-center text-slate-600 text-sm">
        <div className="mb-4">
          <h4 className="font-bold text-slate-800">Trung tâm Tin học ứng dụng Bal Digitech</h4>
          <p className="mt-1 text-slate-600">Cung cấp: Tài khoản Canva, ứng dụng hỗ trợ giáo viên.</p>
          <p className="text-slate-600">Đào tạo: Trí tuệ nhân tạo, E-learning, ứng dụng AI trong giáo dục.</p>
        </div>
        <div className="mb-4">
          <p>
            <strong>Liên hệ đào tạo:</strong> 0972.300.864 - Thầy Giới
          </p>
        </div>
        <div className="text-slate-500">
          <p>Ứng dụng được phát triển bởi Thầy Giới.</p>
        </div>
      </div>
    </footer>
  );
};