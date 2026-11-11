'use client';

import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  QrCode,
  Printer,
  RotateCw,
  Copy,
  Check,
  ShieldCheck,
  Phone,
  Mail,
} from 'lucide-react';

export interface StudentIDCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    studentId?: string;
    programme?: string;
    semester?: string;
    mobile?: string;
    address?: string;
    imageUrl?: string;
  };
}

export function StudentIDCard({ user }: StudentIDCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);
  const imageUrl = user.imageUrl || '';

  const regNo = user.studentId || 'PU2026MCA918';
  const programmeName = user.programme || 'MCA (Master of Computer Applications)';
  const currentSemester = user.semester || 'Semester 1';

  const handleCopyRegNo = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(regNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.print();
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Compact Header Controls */}
      <div className="w-full max-w-[450px] flex items-center justify-between gap-2 px-1 pb-2 text-xs print:hidden">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="font-bold text-slate-800 text-xs">Student Smart ID Card</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            Official
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(!isFlipped);
            }}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs"
            title="Flip to back"
          >
            <RotateCw className="w-3 h-3 text-white" />
            <span>{isFlipped ? 'Front' : 'Flip Card'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-semibold flex items-center gap-1 transition-all shadow-xs"
            title="Print ID Card"
          >
            <Printer className="w-3 h-3 text-sky-300" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* IN-PLACE 3D FLIP CONTAINER (Blue & White Palette) */}
      <div className="w-full max-w-[450px] [perspective:1000px] print:max-w-none">
        <div
          className="grid grid-cols-1 [transform-style:preserve-3d] transition-transform duration-500 ease-in-out"
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* ===================== FRONT SIDE (Blue & White Theme) ===================== */}
          <div
            onClick={() => setIsFlipped(true)}
            className="col-start-1 row-start-1 w-full rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#0c2340] via-[#0f3460] to-[#16213e] text-white shadow-xl shadow-blue-950/40 border border-blue-400/40 relative overflow-hidden [backface-visibility:hidden] select-none cursor-pointer flex flex-col justify-between min-h-[255px]"
            title="Click to flip to back"
          >
            {/* Subtle blue & white background radial highlights */}
            <div className="absolute -top-16 -right-16 w-52 h-52 bg-gradient-to-br from-blue-400/20 via-sky-300/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-gradient-to-tr from-sky-400/15 via-blue-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0d_1px,transparent_1px)] [background-size:14px_14px] pointer-events-none" />

            {/* University Header Banner in Crisp White & Blue */}
            <div className="relative z-10 border-b border-blue-300/25 pb-2.5 mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white p-1 border-2 border-blue-300 shadow-md shadow-blue-500/20 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Periyar University Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xs sm:text-[13px] font-black tracking-wider text-white uppercase leading-none font-serif drop-shadow-xs">
                    PERIYAR UNIVERSITY
                  </h1>
                  <p className="text-[9px] font-bold text-sky-200 tracking-wide mt-0.5">
                    CENTRE FOR DISTANCE AND ONLINE EDUCATION (CDOE)
                  </p>
                  <p className="text-[8px] text-blue-100/80 leading-none">
                    Salem - 636 011, Tamil Nadu • NAAC A++ Grade
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0">
                <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-white text-blue-900 shadow-sm border border-blue-200">
                  ID CARD
                </span>
                <span className="text-[8px] font-mono text-sky-200 mt-0.5">2024-2026</span>
              </div>
            </div>

            {/* Card Body: Photo & Student Credentials in White & Blue */}
            <div className="relative z-10 flex items-center gap-3.5 my-auto">
              {/* Photo Frame */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="relative w-20 h-24 rounded-xl p-0.5 bg-gradient-to-b from-sky-300 via-blue-400 to-blue-700 shadow-md overflow-hidden">
                  <div className="w-full h-full rounded-[10px] bg-slate-900 overflow-hidden relative flex items-center justify-center">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-blue-950 text-blue-200 text-center p-1">
                        <GraduationCap className="w-6 h-6 text-white mb-0.5" />
                        <span className="text-[8px] font-bold text-white">STUDENT</span>
                      </div>
                    )}

                    {/* Hologram badge */}
                    <div className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-blue-600/90 text-white text-[7px] font-black flex items-center gap-0.5 backdrop-blur-xs border border-blue-300/40">
                      <ShieldCheck className="w-2 h-2 text-sky-200" />
                      <span>CDOE</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[8px] font-bold text-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ACTIVE</span>
                </div>
              </div>

              {/* Student Details with Crisp White Text */}
              <div className="flex-1 min-w-0 space-y-1">
                <div>
                  <span className="text-[8px] font-bold uppercase tracking-wider text-sky-300 block">
                    Student Name
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-white tracking-wide uppercase truncate drop-shadow-xs">
                    {user.name}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-semibold text-blue-200">Reg No:</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-white/15 border border-white/30 rounded-lg backdrop-blur-xs">
                    <span className="font-mono font-black text-white text-xs tracking-wider">
                      {regNo}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyRegNo}
                      className="text-sky-200 hover:text-white p-0.5 transition-colors print:hidden"
                      title="Copy Register Number"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                <div className="pt-0.5 space-y-0.5 text-[10px]">
                  <div>
                    <span className="text-blue-200 font-medium">Course: </span>
                    <strong className="text-white font-bold">{programmeName}</strong>
                  </div>
                  <div>
                    <span className="text-blue-200 font-medium">Semester: </span>
                    <span className="text-sky-100 font-semibold">{currentSemester}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 text-[9px] text-blue-200 pt-0.5 truncate">
                  {user.mobile && (
                    <span className="flex items-center gap-0.5">
                      <Phone className="w-2.5 h-2.5 text-sky-300" />
                      <span className="text-white font-medium">{user.mobile}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 truncate">
                    <Mail className="w-2.5 h-2.5 text-sky-300" />
                    <span className="truncate text-white font-medium">{user.email}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Bar: Smart Chip & Signatory in White & Blue */}
            <div className="relative z-10 border-t border-blue-300/20 pt-2 mt-2.5 flex items-center justify-between text-[8px]">
              {/* EMV Chip & Barcode */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-5 rounded bg-gradient-to-tr from-slate-100 via-sky-200 to-blue-300 p-0.5 flex items-center justify-center shadow-xs border border-blue-400/50">
                  <div className="w-full h-full border border-blue-900/30 rounded-[2px] grid grid-cols-2 gap-0.5 p-0.5 opacity-80">
                    <div className="border-r border-b border-blue-950/40" />
                    <div className="border-b border-blue-950/40" />
                    <div className="border-r border-blue-950/40" />
                    <div />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="h-4 flex items-center gap-[1.5px] opacity-90">
                    {[2, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 3, 1, 2].map((w, i) => (
                      <span key={i} className="h-full bg-white block" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span className="text-[7px] font-mono tracking-widest text-sky-200 leading-none mt-0.5">{regNo}</span>
                </div>
              </div>

              {/* Signatory & Flip hint */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-serif italic text-[10px] text-white font-semibold leading-none">
                    R. Sundararajan
                  </div>
                  <div className="text-[7px] uppercase font-bold text-sky-200 mt-0.5">
                    Director, CDOE
                  </div>
                </div>
                <span className="text-[8px] text-white font-bold flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/20 hover:bg-white/20 transition-colors print:hidden">
                  <RotateCw className="w-2.5 h-2.5 text-sky-200" />
                  Flip
                </span>
              </div>
            </div>

            {/* Bottom crisp white & cyan accent strip */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-sky-200 via-white to-blue-400 opacity-90" />
          </div>

          {/* ===================== BACK SIDE (Blue & White Theme) ===================== */}
          <div
            onClick={() => setIsFlipped(false)}
            className="col-start-1 row-start-1 w-full rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#0c2340] via-[#0f3460] to-[#16213e] text-white shadow-xl shadow-blue-950/40 border border-blue-400/40 relative overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] select-none cursor-pointer flex flex-col justify-between min-h-[255px]"
            title="Click to flip to front"
          >
            {/* Top Bar */}
            <div className="border-b border-blue-300/20 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white p-0.5 border border-blue-300 shrink-0 flex items-center justify-center overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="Periyar University Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-white leading-tight">
                    CENTRE FOR DISTANCE & ONLINE EDUCATION
                  </h3>
                  <p className="text-[8px] text-sky-200">
                    Periyar University, Palkalai Nagar, Salem - 636 011
                  </p>
                </div>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-white text-[8px] font-mono font-bold text-blue-900 border border-blue-200">
                CARD BACK
              </span>
            </div>

            {/* Middle Content in Crisp White */}
            <div className="grid grid-cols-3 gap-2.5 my-auto py-1">
              <div className="col-span-2 space-y-1.5 text-[9px] text-blue-100 leading-tight">
                <h4 className="font-bold text-sky-300 uppercase tracking-wide text-[9px]">
                  Instructions:
                </h4>
                <ul className="list-disc list-inside space-y-0.5 text-white text-[8px]">
                  <li>Non-transferable; official property of Periyar University.</li>
                  <li>Must be presented during all online/offline examinations & PCP seminars.</li>
                  <li>In case of loss, report immediately to CDOE office.</li>
                  <li>Enrolled: <strong>{programmeName}</strong>.</li>
                </ul>

                {user.address && (
                  <div className="pt-1">
                    <span className="text-sky-300 block font-semibold text-[8px] uppercase">Address:</span>
                    <span className="text-white text-[8px] line-clamp-1">{user.address}</span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-2 bg-white/10 border border-white/20 rounded-xl text-center">
                <div className="w-14 h-14 bg-white p-1 rounded-lg shadow-sm flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-blue-950" />
                </div>
                <span className="text-[8px] font-mono text-white font-bold mt-1 block">
                  SCAN TO VERIFY
                </span>
                <span className="text-[7px] text-sky-200 block font-mono">
                  {regNo}
                </span>
              </div>
            </div>

            {/* Bottom Support */}
            <div className="border-t border-blue-300/20 pt-2 text-[8px] text-blue-100 flex items-center justify-between">
              <div>
                Helpline: <strong className="text-white">+91 427 2345766</strong> • cdoe@periyaruniversity.ac.in
              </div>
              <span className="text-[8px] text-white font-bold flex items-center gap-0.5 bg-white/10 px-1.5 py-0.5 rounded-md border border-white/20 hover:bg-white/20 transition-colors print:hidden">
                <RotateCw className="w-2.5 h-2.5 text-sky-200" />
                Front
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
