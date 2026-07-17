import React, { useState } from 'react';
import { 
  Home, 
  BarChart2, 
  Settings, 
  Play, 
  AlertTriangle,
  RotateCcw,
  Award,
  Minus,
  User
} from 'lucide-react';

// Grey Placeholder Component to replace the mascot
const ImagePlaceholder = ({ label = "Mascot Placeholder", className = "w-24 h-24" }) => (
  <div className={`bg-slate-200 border border-slate-300 rounded-2xl flex flex-col items-center justify-center p-2 text-center text-[10px] font-bold text-slate-400 select-none ${className}`}>
    <User className="w-5 h-5 mb-1 text-slate-400" />
    <span>{label}</span>
  </div>
);

export default function VispeechProgress() {
  const [currentTab, setCurrentTab] = useState('progress');

  return (
    <div className="flex h-screen w-full bg-[#F8F9FA] text-slate-800 font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-white border-r border-[#EBEFF2] flex flex-col justify-between h-full shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-6 flex items-center gap-3 border-b border-[#F4F6F8]">
            <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
              LOGO
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Vispeech</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button 
              onClick={() => setCurrentTab('home')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>หน้าหลัก</span>
            </button>
            <button 
              onClick={() => setCurrentTab('progress')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-slate-100 text-slate-900 transition-all"
            >
              <BarChart2 className="w-4 h-4 text-slate-900" />
              <span>ความก้าวหน้า</span>
            </button>
            <button 
              onClick={() => setCurrentTab('settings')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span>การตั้งค่า</span>
            </button>
          </nav>

          {/* Left Sidebar Streak Widget */}
          <div className="px-4 mt-4">
            <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-4 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">🔥</span>
                <div className="text-xs font-bold text-slate-800">ต่อเนื่อง 2 วันแล้ว!</div>
              </div>
              
              {/* Mini Calendar Grid */}
              <div className="grid grid-cols-5 gap-1 text-[9px] text-center font-bold mb-3">
                <div className="bg-white p-1 rounded border border-slate-200">อาทิตย์<span className="block text-amber-500">🔥</span></div>
                <div className="bg-white p-1 rounded border border-slate-200">จันทร์<span className="block text-amber-500">🔥</span></div>
                <div className="bg-slate-100/60 text-slate-300 p-1 rounded">อังคาร<span className="block text-slate-300">-</span></div>
                <div className="bg-slate-100/60 text-slate-300 p-1 rounded">พุธ<span className="block text-slate-300">-</span></div>
                <div className="bg-slate-100/60 text-slate-300 p-1 rounded">พฤหัส<span className="block text-slate-300">-</span></div>
              </div>

              <div className="text-[10px] text-slate-500 font-medium">เป้าหมาย 10 วัน</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                <div className="bg-slate-400 h-full rounded-full" style={{ width: '20%' }} />
              </div>
              <div className="text-[9px] text-slate-400 mt-1">อีกแค่ 8 วัน ก็ครบ 10 วันแล้วนะ!</div>
              
              <div className="absolute -right-2 -bottom-2 opacity-10">
                <ImagePlaceholder label="Mascot" className="w-12 h-12 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Left Sidebar Bottom Banner */}
        <div className="p-4 border-t border-[#EBEFF2] space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3 text-center text-xs font-bold text-slate-700 shadow-sm">
            แพ็คที่รออยู่นะ~ ฝึกกันเถอะ!
          </div>
          <div className="flex justify-center">
            <ImagePlaceholder label="Mascot Placeholder" className="w-24 h-24 rounded-full" />
          </div>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-[#EBEFF2] px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 font-medium">Dashboard</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-semibold">ความก้าวหน้า</span>
          </div>
          
          {/* User Profile Avatar Placeholder */}
          <div className="w-8 h-8 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center text-[10px] font-bold text-slate-600 cursor-pointer">
            AVATAR
          </div>
        </header>

        {/* CONTENT CONTAINER */}
        <div className="p-8 max-w-5xl w-full mx-auto space-y-6">
          
          {/* PAGE TITLE */}
          <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
            <BarChart2 className="w-5 h-5 text-slate-800" />
            <h2>ความก้าวหน้าทั้งหมด</h2>
          </div>

          {/* PROGRESS CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* CARD 1: คำศัพท์ง่าย • บทที่ 1 (Active / Completed) */}
            <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 shadow-sm relative flex flex-col justify-between min-h-[240px]">
              {/* Warning Badge Top Right */}
              <div className="absolute top-4 right-4 text-amber-500" title="มีคำแนะนำเพิ่มเติม">
                <AlertTriangle className="w-5 h-5 fill-amber-500 text-white" />
              </div>

              <div className="space-y-4">
                {/* Title & Description */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">คำศัพท์ง่าย</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">บทที่ 1</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[80%]">
                    ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน พร้อมรูปปากและ Feedback ทันทีทุกครั้งที่พูด
                  </p>
                </div>

                {/* Progress Stats */}
                <div className="space-y-1.5">
                  <div className="text-xs font-extrabold text-slate-900">5 / 5 คำ</div>
                  {/* Full Black Progress Bar */}
                  <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden p-1 border border-slate-200">
                    <div className="bg-slate-900 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-700">
                    <span>⭐</span>
                    <span>84.6%</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>มี 2 คำที่ควรฝึกเพิ่ม</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all">
                    <BarChart2 className="w-3.5 h-3.5" />
                    <span>สรุปผล</span>
                  </button>
                  <button className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>เริ่มการฝึกซ้ำ</span>
                  </button>
                </div>

                {/* Grey Mascot Placeholder */}
                <ImagePlaceholder label="Mascot" className="w-16 h-16 rounded-xl shrink-0" />
              </div>
            </div>

            {/* CARD 2: เสียงสระ • บทที่ 1 (Not Started) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[240px]">
              <div className="space-y-4">
                {/* Title & Description */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">เสียงสระ</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">บทที่ 1</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[80%]">
                    ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน พร้อมรูปปากและ Feedback ทันทีทุกครั้งที่พูด
                  </p>
                </div>

                {/* Progress Stats */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-400">0 / 31 เสียง</div>
                  {/* Empty Grey Progress Bar */}
                  <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden p-1 border border-slate-200">
                    <div className="bg-slate-200 h-full rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all">
                  <Play className="w-3 h-3 fill-white" />
                  <span>เริ่มการฝึก</span>
                </button>

                {/* Grey Mascot Placeholder */}
                <ImagePlaceholder label="Mascot" className="w-16 h-16 rounded-xl shrink-0" />
              </div>
            </div>

            {/* CARD 3: บทสนทนา • บทที่ 1 (Not Started) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[240px]">
              <div className="space-y-4">
                {/* Title & Description */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">บทสนทนา</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">บทที่ 1</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-[80%]">
                    ฝึกออกเสียงคำที่ใช้บ่อยในชีวิตประจำวัน พร้อมรูปปากและ Feedback ทันทีทุกครั้งที่พูด
                  </p>
                </div>

                {/* Progress Stats */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-400">0 / 5 บทสนทนา</div>
                  {/* Empty Grey Progress Bar */}
                  <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden p-1 border border-slate-200">
                    <div className="bg-slate-200 h-full rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>

              {/* Bottom Action Row */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <button className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all">
                  <Play className="w-3 h-3 fill-white" />
                  <span>เริ่มการฝึก</span>
                </button>

                {/* Grey Mascot Placeholder */}
                <ImagePlaceholder label="Mascot" className="w-16 h-16 rounded-xl shrink-0" />
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}