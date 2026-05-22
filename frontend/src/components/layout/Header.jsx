import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  User as UserIcon, 
  Check, 
  Settings, 
  DollarSign, 
  Calendar, 
  History, 
  X, 
  Activity,
  FolderKanban,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Lock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LayoutDashboard,
  ClipboardCheck,
  UserCheck,
  Camera,
  Trash2,
  ArrowLeft,
  Eye,
  Crop
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
// Native canvas capture - no external dependency needed for same-origin iframes
import { toast } from 'react-hot-toast';
import useStore from '../../store/useStore';

// Using dynamic iframe rendering for simulator, so page imports are not needed

const Header = ({ currentUser }) => {
  const { 
    notifications, fetchNotifications, markAsRead,
    projectTasks, fetchProjectTasks, addProjectTask, updateProjectTaskStatus 
  } = useStore();

  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Notifications
  const [isProjectOpen, setIsProjectOpen] = useState(false); // Projects panel
  const [activeTab, setActiveTab] = useState('All'); // Notifications tab
  const [projectTab, setProjectTab] = useState('tasks'); // 'tasks', 'problems', 'feedbacks'
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Project item detail modal
  const [selectedProjectTask, setSelectedProjectTask] = useState(null);
  const [editStatus, setEditStatus] = useState('pending');
  const [editReply, setEditReply] = useState('');

  // Helper to safely select project task and set its states to avoid setState-in-effect lint warnings
  const handleSelectProjectTask = (task) => {
    setSelectedProjectTask(task);
    if (task) {
      setEditStatus(task.status);
      setEditReply(task.replyMessage || '');
    }
  };

  // Creation state inline in sidebar
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newType, setNewType] = useState('task');
  const [newContent, setNewContent] = useState('');
  const [newPage, setNewPage] = useState(() => currentUser?.role === 'teacher' ? '/teacher/dashboard' : '/dashboard');
  const [newScreenshot, setNewScreenshot] = useState(null);

  // Preview full site page inside a modal
  const [previewPage, setPreviewPage] = useState(null);
  const [previewMode, setPreviewMode] = useState('interact'); // 'interact' | 'capture'
  const [selection, setSelection] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDrawing: false,
    hasSelection: false
  });

  // Temporary simulator states for unsaved page/screenshot changes
  const [tempPage, setTempPage] = useState('');
  const [tempScreenshot, setTempScreenshot] = useState(null);
  const iframeRef = useRef(null);

  const notificationDropdownRef = useRef(null);
  const projectDropdownRef = useRef(null);

  // Parse helper for project item content
  const parseContent = (contentStr) => {
    try {
      const parsed = JSON.parse(contentStr);
      if (parsed && typeof parsed === 'object') {
        return {
          text: parsed.text || '',
          screenshot: parsed.screenshot || null
        };
      }
    } catch {
      // Return plain text if JSON parsing fails
    }
    return {
      text: contentStr || '',
      screenshot: null
    };
  };

  // Show notifications only on teacher routes, hide on admin pages
  const showNotifications = location.pathname.startsWith('/teacher') && currentUser?.role === 'teacher';
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    fetchNotifications();
    fetchProjectTasks();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchProjectTasks();
    }, 60000); // 60 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications, fetchProjectTasks]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
        setIsProjectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected task state updates are handled by handleSelectProjectTask.
  // Initial page path default is handled by useState function.

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => markAsRead(n.id)));
  };

  const handleNotificationClick = async (n) => {
    setSelectedNotification(n);
    if (!n.isRead) {
      await markAsRead(n.id);
    }
  };

  const handleMouseDown = (e) => {
    if (previewMode !== 'capture') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSelection({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      isDrawing: true,
      hasSelection: false
    });
  };

  const handleMouseMove = (e) => {
    if (previewMode !== 'capture' || !selection.isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setSelection(prev => ({
      ...prev,
      currentX: x,
      currentY: y
    }));
  };

  const handleMouseUp = (e) => {
    if (previewMode !== 'capture' || !selection.isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const x1 = Math.min(selection.startX, x);
    const y1 = Math.min(selection.startY, y);
    const w = Math.abs(selection.startX - x);
    const h = Math.abs(selection.startY - y);

    setSelection(prev => ({
      ...prev,
      isDrawing: false,
      hasSelection: w > 10 && h > 10
    }));

    if (w > 10 && h > 10) {
      captureSelection(x1, y1, w, h);
    }
  };

  const captureSelection = (x1, y1, w, h) => {
    const iframe = iframeRef.current;
    if (!iframe) {
      toast.error("Sahifa yuklanmadi");
      return;
    }

    try {
      // Capture the visible iframe content using native Canvas API.
      // The iframe renders at its CSS size; we draw it onto a canvas,
      // then crop the selected rectangle from that full render.
      const iframeRect = iframe.getBoundingClientRect();
      const iframeW = iframe.offsetWidth;
      const iframeH = iframe.offsetHeight;

      // Step 1: Render the full iframe viewport onto a canvas
      const fullCanvas = document.createElement('canvas');
      fullCanvas.width = iframeW;
      fullCanvas.height = iframeH;
      const fullCtx = fullCanvas.getContext('2d');

      if (!fullCtx) {
        toast.error("Canvas kontekst yaratib bo'lmadi");
        return;
      }

      // For same-origin iframes we can serialize the document to SVG foreignObject
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        toast.error("Sahifa hujjatiga kirish imkoni yo'q");
        return;
      }

      const serializer = new XMLSerializer();
      const htmlStr = serializer.serializeToString(iframeDoc.documentElement);

      const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${iframeW}" height="${iframeH}">
        <foreignObject width="100%" height="100%">
          <html xmlns="http://www.w3.org/1999/xhtml">${htmlStr}</html>
        </foreignObject>
      </svg>`;

      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        fullCtx.drawImage(img, 0, 0, iframeW, iframeH);
        URL.revokeObjectURL(url);

        // Step 2: Crop the selected region from the full render
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = w;
        cropCanvas.height = h;
        const cropCtx = cropCanvas.getContext('2d');

        if (!cropCtx) {
          toast.error("Crop canvas yaratib bo'lmadi");
          return;
        }

        cropCtx.drawImage(fullCanvas, x1, y1, w, h, 0, 0, w, h);

        // Step 3: Scale down to max 320px and iteratively compress under 10KB
        const maxDim = 320;
        let targetW = w;
        let targetH = h;
        if (targetW > maxDim || targetH > maxDim) {
          if (targetW > targetH) {
            targetH = Math.round((targetH * maxDim) / targetW);
            targetW = maxDim;
          } else {
            targetW = Math.round((targetW * maxDim) / targetH);
            targetH = maxDim;
          }
        }

        const compressedCanvas = document.createElement('canvas');
        const compCtx = compressedCanvas.getContext('2d');

        if (compCtx) {
          let quality = 0.25;
          let scale = 1.0;
          let base64 = '';

          // Iterative compression to ensure file size is strictly under 10KB (~13,000 chars base64)
          for (let i = 0; i < 6; i++) {
            const tempW = Math.round(targetW * scale);
            const tempH = Math.round(targetH * scale);
            compressedCanvas.width = tempW;
            compressedCanvas.height = tempH;
            compCtx.clearRect(0, 0, tempW, tempH);
            compCtx.drawImage(cropCanvas, 0, 0, w, h, 0, 0, tempW, tempH);

            base64 = compressedCanvas.toDataURL('image/jpeg', quality);
            if (base64.length < 13000) {
              break;
            }
            scale *= 0.8;
            quality *= 0.85;
          }

          setTempScreenshot(base64);
          setPreviewMode('interact');
          toast.success("Rasm belgilandi va qisqartirildi!");
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        toast.error("Rasmga olishda xatolik yuz berdi");
      };

      img.src = url;
    } catch (err) {
      console.error('Native canvas capture error:', err);
      toast.error("Rasmga olishda xatolik yuz berdi");
    }
  };

  const handleCreateTask = async () => {
    if (!newContent.trim()) return;
    try {
      await addProjectTask({
        type: newType,
        content: JSON.stringify({ text: newContent, screenshot: newScreenshot }),
        page: newPage
      });
      setNewContent('');
      setNewScreenshot(null);
      setIsAddingNew(false);
      toast.success("Loyiha elementi muvaffaqiyatli qo'shildi!");
    } catch (e) {
      console.error(e);
      toast.error("Qo'shishda xatolik yuz berdi");
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedProjectTask) return;
    try {
      await updateProjectTaskStatus(selectedProjectTask.id, editStatus, editReply);
      handleSelectProjectTask(null);
      toast.success("Holat muvaffaqiyatli yangilandi!");
    } catch (err) {
      console.error(err);
      toast.error("Yangilashda xatolik yuz berdi");
    }
  };

  const getNotificationConfig = (n) => {
    const title = (n.title || '').toLowerCase();
    const msg = (n.message || '').toLowerCase();

    if (title.includes('profil') || title.includes('avatar') || title.includes('rasm') || title.includes('photo') || title.includes('user')) {
      return {
        icon: UserIcon,
        iconBg: 'bg-[#ec4899]/15 text-[#ec4899] border border-[#ec4899]/30',
        category: 'Logs'
      };
    }

    if (title.includes('sana') || title.includes('kun') || title.includes('vaqt') || title.includes('dars') || title.includes('taqvim') || msg.includes('dars') || msg.includes('soat')) {
      return {
        icon: Calendar,
        iconBg: 'bg-[#0ea5e9]/15 text-[#0ea5e9] border border-[#0ea5e9]/30',
        category: 'Events'
      };
    }

    if (title.includes('to\'lov') || title.includes('tolov') || title.includes('payment') || title.includes('pul') || title.includes('yakunlandi') || title.includes('muvaffaqiyatli') || msg.includes('to\'lov') || msg.includes('tolov')) {
      return {
        icon: DollarSign,
        iconBg: 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30',
        category: 'Alerts'
      };
    }

    if (title.includes('oylik') || title.includes('moshina') || title.includes('diagram') || title.includes('tizim') || title.includes('arxiv') || title.includes('sozlama')) {
      return {
        icon: Activity,
        iconBg: 'bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30',
        category: 'Logs'
      };
    }

    if (title.includes('xabar') || title.includes('ogohlantirish') || title.includes('alert') || title.includes('xato') || title.includes('weekly') || title.includes('tarix') || title.includes('log')) {
      return {
        icon: History,
        iconBg: 'bg-[#f43f5e]/15 text-[#f43f5e] border border-[#f43f5e]/30',
        category: 'Logs'
      };
    }

    return {
      icon: Bell,
      iconBg: 'bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/30',
      category: 'Alerts'
    };
  };

  const filteredNotifications = notifications.filter(n => {
    const config = getNotificationConfig(n);
    if (activeTab === 'All') return true;
    return config.category === activeTab;
  });

  // Helper for available pages is replaced with static select lists below.

  const pendingCount = projectTasks.filter(t => t.status === 'pending').length;
  const progressCount = projectTasks.filter(t => t.status === 'in_progress').length;
  const completedCount = projectTasks.filter(t => t.status === 'completed').length;
  const totalCount = projectTasks.length;

  const filteredProjectTasks = projectTasks.filter(item => {
    if (projectTab === 'tasks') return item.type === 'task';
    if (projectTab === 'problems') return item.type === 'problem';
    if (projectTab === 'feedbacks') return item.type === 'feedback';
    return true;
  });

  const canUpdateTask = currentUser?.username?.toLowerCase() === 'azimjon' || currentUser?.role === 'admin';

  // Dynamic page sync on iframe load
  const handleIframeLoad = (e) => {
    try {
      const iframe = e.target;
      if (iframe && iframe.contentWindow) {
        const currentPath = iframe.contentWindow.location.pathname;
        if (currentPath && currentPath !== '/' && currentPath !== '/login') {
          setTempPage(currentPath);
        }
      }
    } catch (err) {
      console.error('Failed to sync iframe path:', err);
    }
  };

  return (
    <>
      <header className="h-14 px-6 flex items-center justify-between sticky top-0 z-[99] bg-white/40 dark:bg-slate-900/60 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-all shrink-0">
        
        {/* Chap qism: Qidiruv joyi */}
        <div className="flex items-center gap-6"></div>

        {/* O'ng qism: Amallar va Profil */}
        <div className="flex items-center gap-4">

          {/* Project Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setIsProjectOpen(true);
                setIsDropdownOpen(false);
              }}
              className={`relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 active:scale-95 ${
                isProjectOpen ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : ''
              }`}
              title="Loyiha vazifalari, muammolar va fikrlar"
            >
              <FolderKanban size={18} />
              {(pendingCount + progressCount) > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              )}
            </button>
          </div>

          {showNotifications && (
            <div className="relative" ref={notificationDropdownRef}>
              <button 
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setIsProjectOpen(false);
                }}
                className={`relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all duration-200 active:scale-95 ${
                  isDropdownOpen ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : ''
                }`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-slate-800 dark:text-slate-200">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        Bildirishnomalar
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button 
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-bold transition-colors flex items-center gap-0.5 cursor-pointer"
                        >
                          <Check size={12} /> Hamma o'qilgan
                        </button>
                      )}
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center px-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 select-none">
                    {['All', 'Alerts', 'Events', 'Logs'].map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-2.5 relative cursor-pointer transition-colors ${
                          activeTab === tab ? 'text-indigo-600 dark:text-indigo-400 font-extrabold' : 'hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        {tab}
                        {activeTab === tab && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 custom-scrollbar">
                    {filteredNotifications.length > 0 ? (
                      filteredNotifications.map((n) => {
                        const config = getNotificationConfig(n);
                        const Icon = config.icon;
                        return (
                          <div 
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all flex items-start gap-4 ${
                              !n.isRead ? 'bg-slate-50/50 dark:bg-slate-800/10' : ''
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${config.iconBg}`}>
                              <Icon size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={`text-xs font-bold leading-snug truncate ${
                                  !n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'
                                }`}>
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0"></span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-2 mt-0.5 font-normal">
                                {n.message}
                              </p>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 block font-semibold">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {' • '}
                                {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-12 px-4 text-center select-none">
                        <p className="text-[12px] text-slate-400 dark:text-slate-500 font-bold">
                          Hech qanday bildirishnoma yo'q
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block select-none">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {currentUser?.username || 'Foydalanuvchi'}
              </p>
              <p className="text-[10px] text-emerald-500 font-bold mt-0.5 flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Faol
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-800 select-none">
              {currentUser?.username ? (
                <span className="text-white font-black text-xs">
                  {currentUser.username.substring(0, 1).toUpperCase()}
                </span>
              ) : (
                <UserIcon size={14} className="text-white" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal - Notification Details */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedNotification(null)}
          />
          
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-200">
            <button 
              onClick={() => setSelectedNotification(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${getNotificationConfig(selectedNotification).iconBg}`}>
                {React.createElement(getNotificationConfig(selectedNotification).icon, { size: 18 })}
              </div>
              <div className="flex flex-col select-none">
                <span className="text-[9px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400">
                  {getNotificationConfig(selectedNotification).category}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
                  Bildirishnoma tafsilotlari
                </span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">
              {selectedNotification.title}
            </h3>

            <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 rounded-xl p-4 my-4 max-h-[220px] overflow-y-auto custom-scrollbar">
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap select-text font-normal">
                {selectedNotification.message}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-6 bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60 select-none">
              <span className="flex flex-col gap-0.5">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">Sana va Vaqt</span>
                <span className="text-slate-700 dark:text-slate-300 font-bold">
                  {new Date(selectedNotification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                  {new Date(selectedNotification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
              <span className="flex flex-col items-end gap-0.5">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-extrabold">Holati</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  selectedNotification.isRead ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {selectedNotification.isRead ? 'O\'qildi' : 'Yangi'}
                </span>
              </span>
            </div>

            <button
              onClick={() => setSelectedNotification(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/10 uppercase tracking-wider cursor-pointer"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* Modal - Preview Selected Page (Simulator) */}
      {previewPage && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            onClick={() => setPreviewPage(null)}
          />
          
          <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.3)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-200">
            
            {/* macOS Chrome UI top bar */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 select-none shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                
                {/* 3 macOS window buttons */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-600 cursor-pointer flex items-center justify-center text-[8px] text-rose-900 font-bold" onClick={() => setPreviewPage(null)}>&times;</span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600" />
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center gap-0.5 text-slate-400 dark:text-slate-500 shrink-0 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button 
                      type="button"
                      onClick={() => {
                        const iframe = iframeRef.current;
                        if (iframe && iframe.contentWindow) {
                          try { iframe.contentWindow.history.back(); } catch {}
                        }
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white rounded transition-all cursor-pointer text-slate-500 dark:text-slate-400"
                      title="Orqaga"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const iframe = iframeRef.current;
                        if (iframe && iframe.contentWindow) {
                          try { iframe.contentWindow.history.forward(); } catch {}
                        }
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white rounded transition-all cursor-pointer text-slate-500 dark:text-slate-400"
                      title="Oldinga"
                    >
                      <ChevronRight size={14} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const iframe = iframeRef.current;
                        if (iframe) {
                          try { 
                            const currentSrc = iframe.src;
                            iframe.src = currentSrc + '';
                          } catch {}
                        }
                      }}
                      className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white rounded transition-all cursor-pointer text-slate-500 dark:text-slate-400"
                      title="Yangilash"
                    >
                      <RefreshCw size={11} />
                    </button>
                  </div>
                </div>

                {/* Mock Address Bar */}
                <div className="flex-1 max-w-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-1.5 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-mono shadow-inner">
                  <Lock size={12} className="text-emerald-500" />
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight text-[9px]">UITS:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold overflow-hidden text-ellipsis whitespace-nowrap">{tempPage || '/'}</span>
                </div>

                {/* Controls: Interact / Capture */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0 gap-0.5">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('interact')}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        previewMode === 'interact' 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Eye size={12} />
                      Ko'rish
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewMode('capture');
                        setSelection({
                          startX: 0,
                          startY: 0,
                          currentX: 0,
                          currentY: 0,
                          isDrawing: false,
                          hasSelection: false
                        });
                      }}
                      className={`px-3 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        previewMode === 'capture' 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Crop size={12} />
                      Belgilash
                    </button>
                  </div>

                  {tempScreenshot && (
                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                      <span>Rasm olindi ({Math.round((tempScreenshot.length * 3) / 4 / 1024 * 10) / 10} KB)</span>
                      <button 
                        type="button"
                        onClick={() => setTempScreenshot(null)}
                        className="text-slate-400 hover:text-rose-500 font-bold ml-1 cursor-pointer transition-colors"
                        title="Rasm o'chirish"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setNewPage(tempPage);
                      setNewScreenshot(tempScreenshot);
                      setPreviewPage(null);
                      toast.success("Sahifa va rasm saqlandi!");
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    Tasdiqlash
                  </button>
                </div>
              </div>

              {/* Quick links tag bar */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full custom-scrollbar py-0.5 border-t border-slate-200/60 dark:border-slate-800/50 pt-2 shrink-0 select-none">
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider whitespace-nowrap">Tezkor o'tish:</span>
                {(currentUser?.role === 'teacher' ? [
                  { path: '/teacher/dashboard', label: 'Dashboard' },
                  { path: '/teacher/attendance', label: 'Davomat' },
                  { path: '/teacher/groups', label: 'Guruhlar' },
                  { path: '/teacher/finance', label: 'Moliya / Oylik' },
                  { path: '/teacher/report', label: 'Hisobot' },
                  { path: '/teacher/settings', label: 'Sozlamalar' },
                ] : [
                  { path: '/dashboard', label: 'Dashboard' },
                  { path: '/students', label: 'O\'quvchilar' },
                  { path: '/staff', label: 'Xodimlar' },
                  { path: '/groups', label: 'Guruhlar' },
                  { path: '/payments', label: 'To\'lovlar' },
                  { path: '/finance', label: 'Moliya' },
                  { path: '/certificates', label: 'Sertifikatlar' },
                  { path: '/settings', label: 'Sozlamalar' },
                  { path: '/reports', label: 'Hisobotlar' },
                ]).map(link => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => {
                      if (iframeRef.current) {
                        iframeRef.current.src = window.location.origin + link.path;
                      }
                      setTempPage(link.path);
                    }}
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                      tempPage === link.path 
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20' 
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Viewport wrap */}
            <div className="flex-1 flex overflow-hidden relative bg-white" id="preview-page-wrapper">
              <iframe 
                src={window.location.origin + previewPage} 
                className="w-full h-full border-0 bg-white"
                id="preview-iframe"
                ref={iframeRef}
                onLoad={handleIframeLoad}
              />
              
              {/* Drawing / selection crop overlay */}
              {previewMode === 'capture' && (
                <div 
                  className="absolute inset-0 z-50 cursor-crosshair select-none bg-black/20"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                >
                  {(selection.isDrawing || selection.hasSelection) && (
                    <div 
                      className="absolute border border-dashed border-indigo-500 bg-indigo-500/5 pointer-events-none transition-all duration-75"
                      style={{
                        left: Math.min(selection.startX, selection.currentX),
                        top: Math.min(selection.startY, selection.currentY),
                        width: Math.abs(selection.startX - selection.currentX),
                        height: Math.abs(selection.startY - selection.currentY),
                        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)'
                      }}
                    >
                      <span className="absolute bottom-2 right-2 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow select-none">
                        {Math.round(Math.abs(selection.startX - selection.currentX))} x {Math.round(Math.abs(selection.startY - selection.currentY))} px
                      </span>
                    </div>
                  )}

                  {!selection.isDrawing && !selection.hasSelection && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-200 pointer-events-auto select-none backdrop-blur-md">
                        <Crop size={14} className="text-indigo-500 animate-bounce" />
                        <span>Sichqoncha bilan kerakli qismni bosing va torting (Avtomatik siqiladi).</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Drawer - Projects (Sidebar) */}
      {isProjectOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-950/40 dark:bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => {
              setIsProjectOpen(false);
              setIsAddingNew(false);
              handleSelectProjectTask(null);
            }}
          />
          
          <div className="relative w-full sm:w-[460px] h-screen bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 shadow-2xl flex flex-col z-[9999] animate-in slide-in-from-right duration-300 ease-out overflow-hidden">
            
            {/* Ambient glow accent top line */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-full shrink-0" />

            {/* Sidebar header */}
            <div className="px-6 py-4.5 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200/60 dark:border-slate-800 flex items-center justify-between shrink-0 select-none">
              {selectedProjectTask ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSelectProjectTask(null)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mr-1 cursor-pointer"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                    Element Batafsil
                  </span>
                </div>
              ) : isAddingNew ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsAddingNew(false)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 mr-1 cursor-pointer"
                  >
                    <ArrowLeft size={15} />
                  </button>
                  <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                    Yangi Loyiha Elementi
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <FolderKanban size={16} className="text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                    Loyiha Boshqaruvi
                  </span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {!isAddingNew && !selectedProjectTask && (
                  <button 
                    onClick={() => setIsAddingNew(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black px-3.5 py-1.5 rounded-xl flex items-center gap-1 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Plus size={12} /> Qo'shish
                  </button>
                )}
                <button 
                  onClick={() => {
                    setIsProjectOpen(false);
                    setIsAddingNew(false);
                    handleSelectProjectTask(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sidebar content body */}
            {selectedProjectTask ? (
              
              /* 1. Detail View inside Sidebar */
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/50 dark:bg-slate-900/40 animate-in fade-in duration-200">
                
                {/* Creator card */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shrink-0 shadow">
                    {selectedProjectTask.creatorName ? selectedProjectTask.creatorName.substring(0, 2).toUpperCase() : 'US'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-400 block mb-0.5">
                      {selectedProjectTask.type}
                    </span>
                    <span className="text-xs text-slate-800 dark:text-slate-100 font-bold block truncate">
                      {selectedProjectTask.creatorName || 'Noma\'lum'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                      Rol: {selectedProjectTask.creatorRole || 'Foydalanuvchi'}
                    </span>
                  </div>
                  
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                    selectedProjectTask.status === 'completed' 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' 
                      : selectedProjectTask.status === 'in_progress' 
                        ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' 
                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {selectedProjectTask.status === 'completed' ? 'Bajarildi' : selectedProjectTask.status === 'in_progress' ? 'Jarayonda' : 'Kutilmoqda'}
                  </span>
                </div>

                {/* Detail text description */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Tavsif matni</span>
                  <div className="bg-slate-50/60 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 max-h-[220px] overflow-y-auto custom-scrollbar select-text leading-relaxed text-xs text-slate-700 dark:text-slate-300">
                    {parseContent(selectedProjectTask.content).text}
                  </div>
                </div>

                {/* Screenshot attached */}
                {parseContent(selectedProjectTask.content).screenshot && (
                  <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-4 flex flex-col gap-2">
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider">Ekran Tasviri:</span>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center max-h-[220px] shadow-inner group">
                      <img 
                        src={parseContent(selectedProjectTask.content).screenshot} 
                        alt="Task Crop" 
                        className="max-w-full max-h-[200px] object-contain group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  </div>
                )}

                {/* Link to target page */}
                <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/40 p-3.5 rounded-2xl flex items-center justify-between text-xs select-none">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">Bog'langan Sahifa:</span>
                  <button
                    onClick={() => {
                      setPreviewPage(selectedProjectTask.page);
                      setTempPage(selectedProjectTask.page);
                      setTempScreenshot(parseContent(selectedProjectTask.content).screenshot);
                      setPreviewMode('interact');
                    }}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-black transition-colors font-mono"
                  >
                    {selectedProjectTask.page}
                  </button>
                </div>

                {/* Editing form fields for admin / azimjon */}
                {canUpdateTask ? (
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Holatni o'zgartirish</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                      >
                        <option value="pending">Kutilmoqda (Pending)</option>
                        <option value="in_progress">Faol / Jarayonda (In Progress)</option>
                        <option value="completed">Bajarildi (Completed)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Javob xabari</label>
                      <textarea
                        value={editReply}
                        onChange={(e) => setEditReply(e.target.value)}
                        rows={3}
                        placeholder="Ushbu elementga javob yozing..."
                        className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-400 dark:placeholder-slate-600 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Admin Javobi</span>
                      <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3 min-h-[60px] max-h-[120px] overflow-y-auto custom-scrollbar">
                        {selectedProjectTask.replyMessage ? (
                          <p className="text-slate-700 dark:text-slate-300 text-xs whitespace-pre-wrap select-text leading-relaxed">
                            {selectedProjectTask.replyMessage}
                          </p>
                        ) : (
                          <p className="text-slate-400 dark:text-slate-600 text-xs italic font-semibold">
                            Javob hali yozilmagan
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => handleSelectProjectTask(null)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                  >
                    Orqaga
                  </button>
                  {canUpdateTask && (
                    <button
                      type="button"
                      onClick={handleUpdateTask}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Saqlash
                    </button>
                  )}
                </div>
              </div>
            ) : isAddingNew ? (
              
              /* 2. Creation Form View inside Sidebar */
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white/50 dark:bg-slate-900/40 animate-in fade-in duration-200">
                
                {/* Element type selector */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 select-none">Element turi</label>
                  <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-0.5 rounded-xl shrink-0 gap-0.5">
                    <button
                      type="button"
                      onClick={() => setNewType('task')}
                      className={`flex-1 py-2 text-center rounded-lg text-xs font-black cursor-pointer transition-all ${
                        newType === 'task' 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      Task (Vazifa)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('problem')}
                      className={`flex-1 py-2 text-center rounded-lg text-xs font-black cursor-pointer transition-all ${
                        newType === 'problem' 
                          ? 'bg-rose-600 text-white shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      Problem (Muammo)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewType('feedback')}
                      className={`flex-1 py-2 text-center rounded-lg text-xs font-black cursor-pointer transition-all ${
                        newType === 'feedback' 
                          ? 'bg-amber-600 text-white shadow-sm' 
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      }`}
                    >
                      Feedback (Fikr)
                    </button>
                  </div>
                </div>

                {/* Page selection trigger for Simulator */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 select-none">Sahifani tanlash (Simulator)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewPage(newPage);
                      setTempPage(newPage);
                      setTempScreenshot(newScreenshot);
                      setPreviewMode('interact');
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl p-3 flex items-center justify-between group cursor-pointer transition-all duration-200 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 transition-all shrink-0">
                        <Camera size={14} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider">Tanlangan Sahifa</span>
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-mono font-bold mt-0.5 truncate max-w-[160px]">{newPage}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-500/10 px-2.5 py-1 rounded-lg group-hover:bg-indigo-500/20 transition-all flex items-center gap-0.5 shrink-0 select-none">
                      Sahifani tanlash <ChevronRight size={12} />
                    </span>
                  </button>
                </div>

                {/* Screenshot attached (auto compressed) */}
                {newScreenshot && (
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-2 relative animate-in zoom-in-95 duration-200">
                    <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-wider">Biriktirilgan Rasm (Siqilgan):</span>
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[140px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center shadow-inner">
                      <img src={newScreenshot} alt="Screenshot Preview" className="max-w-full max-h-[130px] object-contain" />
                      <div className="absolute bottom-2 left-2 bg-black/60 text-emerald-400 text-[8px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 select-none">
                        Hajmi: {Math.round((newScreenshot.length * 3) / 4 / 1024 * 10) / 10} KB
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewScreenshot(null)}
                        className="absolute top-2 right-2 p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg transition-colors shadow cursor-pointer border border-rose-600"
                        title="Rasm o'chirish"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Form description textarea */}
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2 select-none">Tavsif (Matni)</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={6}
                    placeholder="Tavsifni yoki fikrni shu yerga batafsil yozing..."
                    className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-400 dark:placeholder-slate-600 resize-none leading-relaxed"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setNewContent('');
                      setNewScreenshot(null);
                    }}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateTask}
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            ) : (
              
              /* 3. List View inside Sidebar */
              <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-white/50 dark:bg-slate-900/40">
                
                {/* Stats grid widget */}
                <div className="grid grid-cols-2 gap-3 shrink-0 text-slate-700 dark:text-slate-300 select-none">
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-3 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-600">Kutilmoqda</span>
                      <Clock size={14} className="text-amber-550 shrink-0" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-amber-600">{pendingCount}</span>
                      <span className="text-[8px] text-slate-400 block mt-0.5 font-bold uppercase">Pending</span>
                    </div>
                  </div>

                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600">Bajarildi</span>
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-emerald-600">{completedCount}</span>
                      <span className="text-[8px] text-slate-400 block mt-0.5 font-bold uppercase">Completed</span>
                    </div>
                  </div>

                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-3 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600">Jarayonda</span>
                      <RefreshCw size={13} className="text-indigo-500 shrink-0" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{progressCount}</span>
                      <span className="text-[8px] text-slate-400 block mt-0.5 font-bold uppercase">In Progress</span>
                    </div>
                  </div>

                  <div className="bg-sky-500/5 border border-sky-500/10 rounded-2xl p-3 flex flex-col justify-between hover:scale-[1.02] transition-all duration-300 shadow-sm">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-sky-600">Jami</span>
                      <FolderKanban size={13} className="text-sky-500 shrink-0" />
                    </div>
                    <div>
                      <span className="text-lg font-black text-sky-600">{totalCount}</span>
                      <span className="text-[8px] text-slate-400 block mt-0.5 font-bold uppercase">Total</span>
                    </div>
                  </div>
                </div>

                {/* Sub tabs list: Tasks, Problems, Feedbacks */}
                <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-0.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 select-none">
                  <button
                    onClick={() => setProjectTab('tasks')}
                    className={`flex-1 py-1.5 text-center rounded-lg cursor-pointer transition-all ${
                      projectTab === 'tasks' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white font-bold shadow-sm' : 'hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => setProjectTab('problems')}
                    className={`flex-1 py-1.5 text-center rounded-lg cursor-pointer transition-all ${
                      projectTab === 'problems' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white font-bold shadow-sm' : 'hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Problems
                  </button>
                  <button
                    onClick={() => setProjectTab('feedbacks')}
                    className={`flex-1 py-1.5 text-center rounded-lg cursor-pointer transition-all ${
                      projectTab === 'feedbacks' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-white font-bold shadow-sm' : 'hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Feedbacks
                  </button>
                </div>

                {/* Task cards list */}
                <div className="space-y-4">
                  {filteredProjectTasks.length > 0 ? (
                    filteredProjectTasks.map((item) => {
                      let statusColor = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20';
                      let statusLabel = 'Kutilmoqda';
                      if (item.status === 'in_progress') {
                        statusColor = 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20';
                        statusLabel = 'Jarayonda';
                      } else if (item.status === 'completed') {
                        statusColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
                        statusLabel = 'Bajarildi';
                      }

                      const parsed = parseContent(item.content);
                      const itemText = parsed.text;
                      const itemScreenshot = parsed.screenshot;

                      return (
                        <div 
                          key={item.id}
                          className="bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3.5 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/[0.02] transition-all duration-300 group animate-in fade-in duration-200"
                        >
                          <div className="flex items-start justify-between gap-3 select-none">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/15 flex items-center justify-center text-[10px] font-black shadow-sm uppercase shrink-0">
                                {item.creatorName ? item.creatorName.substring(0, 2).toUpperCase() : 'US'}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight font-sans">
                                  {item.creatorName || 'Noma\'lum'}
                                </span>
                                <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider mt-0.5">
                                  {item.creatorRole || 'Foydalanuvchi'}
                                </span>
                              </div>
                            </div>
                            
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </div>

                          <div className="flex gap-3 items-start">
                            <p className="flex-1 text-[11px] text-slate-600 dark:text-slate-300 font-normal leading-relaxed whitespace-pre-wrap select-text bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/50 max-h-[100px] overflow-hidden text-ellipsis">
                              {itemText}
                            </p>
                            {itemScreenshot && (
                              <div 
                                className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0 flex items-center justify-center cursor-pointer hover:border-indigo-500/40 transition-colors shadow-inner"
                                onClick={() => handleSelectProjectTask(item)}
                                title="Rasm ko'rish"
                              >
                                <img src={itemScreenshot} alt="Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 select-none">
                            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider">Oyna:</span>
                              <button
                                onClick={() => {
                                  setPreviewPage(item.page);
                                  setTempPage(item.page);
                                  setTempScreenshot(parsed.screenshot);
                                  setPreviewMode('interact');
                                }}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-bold transition-all underline cursor-pointer font-mono"
                                title="Sahifani ochish"
                              >
                                {item.page}
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              {item.replyMessage && (
                                <span className="text-[8px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/15 flex items-center gap-0.5" title={item.replyMessage}>
                                  <MessageSquare size={8} /> Javob bor
                                </span>
                              )}
                              <button
                                onClick={() => handleSelectProjectTask(item)}
                                className="bg-indigo-600/10 dark:bg-indigo-600/15 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-indigo-500/10"
                              >
                                Batafsil
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-16 text-center bg-slate-50/50 dark:bg-slate-950/40 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 select-none">
                      <FolderKanban size={32} className="text-slate-400 dark:text-slate-700 mx-auto mb-2.5 animate-pulse" />
                      <p className="text-[12px] text-slate-400 dark:text-slate-500 font-bold">
                        Hech qanday element topilmadi
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;