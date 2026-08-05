import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  DollarSign,
  Settings,
  ListFilter,
  Users,
  Shield,
  MessageSquare,
  Save,
  Bell,
  RefreshCw,
  Compass,
  Video,
  Image,
  Globe,
  Zap,
  Check,
  Eye,
  EyeOff,
  Star,
  UploadCloud,
  Copy,
  Film,
  MessageCircle,
  FolderPlus,
  ArrowUp,
  ArrowDown,
  Lock,
  LogOut,
  Calendar,
  Filter,
  Key,
  Loader2
} from 'lucide-react';
import {
  Listing,
  BookingRequest,
  Transaction,
  PlatformSettings,
  NotificationLog,
  BlogArticle,
  RoomPhoto,
  VideoShot,
  Review,
  AuditLog
} from '../types';

interface UploadedMediaAsset {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  type: 'image' | 'video';
  uploadedAt: string;
}

interface AdminDashboardProps {
  listings: Listing[];
  bookings: BookingRequest[];
  transactions: Transaction[];
  settings: PlatformSettings;
  notifications: NotificationLog[];
  blogs?: BlogArticle[];
  initialListingToEdit?: Listing | null;
  onClose: () => void;
  onAddListing: (listingData: Partial<Listing>) => void;
  onUpdateListing: (id: string, listingData: Partial<Listing>) => void;
  onDeleteListing: (id: string) => void;
  onUpdateBookingStatus: (bookingId: string, status: 'approved' | 'declined') => void;
  onSaveSettings: (settings: Partial<PlatformSettings>) => void;
  onAddBlog?: (blog: Partial<BlogArticle>) => void;
  onDeleteBlog?: (id: string) => void;
}

export const DEFAULT_THIKA_COTTAGE_DESCRIPTION = "Thika town has its own quiet charm, and this cottage carries it well. Fresh coffee smell drifts in from the farm next door, the garden is loud with birds rather than traffic, and the host checks in without hovering. Beds are firm, water runs hot, wifi holds up for calls. Close enough to town for a quick supermarket run, far enough to still feel like a break.";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  listings,
  bookings,
  transactions,
  settings,
  notifications,
  blogs = [],
  initialListingToEdit = null,
  onClose,
  onAddListing,
  onUpdateListing,
  onDeleteListing,
  onUpdateBookingStatus,
  onSaveSettings,
  onAddBlog,
  onDeleteBlog
}) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'listings' | 'media' | 'cms' | 'blogs' | 'reviews' | 'settings' | 'notifications'>('requests');

  // Admin Security Gate State (First Layer of Defense)
  const [isGateUnlocked, setIsGateUnlocked] = useState<boolean>(() => {
    const stored = sessionStorage.getItem('tx_admin_gate_unlocked');
    const expires = sessionStorage.getItem('tx_admin_gate_expires');
    if (stored === 'true' && expires && Number(expires) > Date.now()) {
      return true;
    }
    return false;
  });
  const [gatePasswordInput, setGatePasswordInput] = useState('');
  const [showGatePassword, setShowGatePassword] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [isSubmittingGate, setIsSubmittingGate] = useState(false);

  // Admin Authentication State (Second Layer of Defense)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('tx_admin_authenticated') === 'true';
  });
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Booking Requests Filter State
  const [bookingStatusFilter, setBookingStatusFilter] = useState<'all' | 'pending' | 'approved' | 'declined' | 'confirmed' | 'cancelled'>('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');

  // Transactions Date Range Filter State
  const [txDateRange, setTxDateRange] = useState<'all' | 'this_month' | 'last_month' | 'custom'>('all');
  const [txCustomStart, setTxCustomStart] = useState('');
  const [txCustomEnd, setTxCustomEnd] = useState('');

  const handleVerifyGatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    setIsSubmittingGate(true);

    try {
      const res = await fetch('/api/admin/verify-gate-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: gatePasswordInput })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem('tx_admin_gate_unlocked', 'true');
        sessionStorage.setItem('tx_admin_gate_expires', String(data.expiresAt || (Date.now() + 4 * 60 * 60 * 1000)));
        setIsGateUnlocked(true);
        setGatePasswordInput('');
      } else {
        setGateError(data.error || 'Incorrect password.');
      }
    } catch (err: any) {
      setGateError('Incorrect password.');
    } finally {
      setIsSubmittingGate(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    }
  };

  useEffect(() => {
    if (isGateUnlocked && isAdminAuthenticated) {
      fetchAuditLogs();
    }
  }, [isGateUnlocked, isAdminAuthenticated]);

  useEffect(() => {
    if (initialListingToEdit && isGateUnlocked && isAdminAuthenticated) {
      setActiveTab('listings');
      handleEditListingClick(initialListingToEdit);
    }
  }, [initialListingToEdit, isGateUnlocked, isAdminAuthenticated]);


  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthError(null);
    setIsSubmittingAuth(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminEmailInput,
          password: adminPasswordInput,
          pin: adminPinInput
        })
      });

      if (res.ok) {
        localStorage.setItem('tx_admin_authenticated', 'true');
        setIsAdminAuthenticated(true);
        fetchAuditLogs();
      } else {
        const err = await res.json();
        setAdminAuthError(err.error || 'Invalid administrator credentials or PIN.');
      }
    } catch (err: any) {
      setAdminAuthError('Failed to verify admin login credentials.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('tx_admin_gate_unlocked');
    sessionStorage.removeItem('tx_admin_gate_expires');
    localStorage.removeItem('tx_admin_authenticated');
    setIsGateUnlocked(false);
    setIsAdminAuthenticated(false);
  };

  // Media Vault Upload State
  const [uploadedVaultAssets, setUploadedVaultAssets] = useState<UploadedMediaAsset[]>([
    {
      url: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
      filename: 'texas-luxury-ranch.jpg',
      size: 2450000,
      mimetype: 'image/jpeg',
      type: 'image',
      uploadedAt: new Date().toISOString()
    },
    {
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      filename: 'hill-country-sunset-tour.mp4',
      size: 15400000,
      mimetype: 'video/mp4',
      type: 'video',
      uploadedAt: new Date().toISOString()
    }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMessage, setUploadProgressMessage] = useState<string | null>(null);
  const [uploadProgressPercent, setUploadProgressPercent] = useState<number>(0);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [pastedImageUrl, setPastedImageUrl] = useState<string>('');
  const [pastedUrlSuccess, setPastedUrlSuccess] = useState<string | null>(null);
  const [copiedPhotoIndex, setCopiedPhotoIndex] = useState<number | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedUploadTargetListing, setSelectedUploadTargetListing] = useState<string>('none');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reviews State
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingReviewComment, setEditingReviewComment] = useState<string>('');
  const [editingReviewRating, setEditingReviewRating] = useState<number>(5);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviewsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateReview = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: editingReviewComment, rating: editingReviewRating })
      });
      if (res.ok) {
        await fetchReviews();
        setEditingReviewId(null);
      }
    } catch (err) {
      console.error('Failed to update review:', err);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchReviews();
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  // Client-side image optimization helper (downscales huge camera photos to max 2000px, quality 0.82)
  const compressImageFile = async (file: File): Promise<File> => {
    if (!file.type.startsWith('image/') || file.size <= 1 * 1024 * 1024) {
      return file;
    }
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let width = img.width;
        let height = img.height;
        const maxDimension = 2000;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.82
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  };

  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // XHR upload helper with real-time percentage progress
  const uploadWithXHR = (
    files: File[],
    onProgress: (percent: number) => void
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      files.forEach((f) => formData.append('media', f));

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || `Upload error HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status HTTP ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => reject(new Error('Network connection failed during upload'));
      xhr.ontimeout = () => reject(new Error('Upload connection timed out'));

      xhr.open('POST', '/api/upload', true);
      xhr.send(formData);
    });
  };

  // Upload handler for multipart/form-data with automatic multi-protocol fallback
  const handleFileUpload = async (filesList: FileList | File[], targetListingId?: string) => {
    const rawFiles = Array.from(filesList);
    if (rawFiles.length === 0) return;

    // Enforce size limits: Photos max 20MB, Videos max 200MB
    const MAX_PHOTO_SIZE = 20 * 1024 * 1024;
    const MAX_VIDEO_SIZE = 200 * 1024 * 1024;

    for (const file of rawFiles) {
      const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v)$/i.test(file.name);
      const cap = isVideo ? MAX_VIDEO_SIZE : MAX_PHOTO_SIZE;
      const capLabel = isVideo ? '200MB' : '20MB';

      if (file.size > cap) {
        const fileMB = (file.size / (1024 * 1024)).toFixed(1);
        setUploadProgressMessage(`❌ File "${file.name}" (${fileMB}MB) exceeds max size limit of ${capLabel}.`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgressPercent(5);
    setUploadProgressMessage(`Preparing ${rawFiles.length} file(s)...`);

    try {
      // Step 1: Compress large images client-side
      setUploadProgressMessage(`Optimizing ${rawFiles.length} file(s) for quick upload...`);
      const processedFiles: File[] = [];
      for (const file of rawFiles) {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImageFile(file);
          processedFiles.push(compressed);
        } else {
          processedFiles.push(file);
        }
      }

      // Step 2: Upload with progress feedback and resilient fallbacks
      setUploadProgressMessage(`Uploading ${processedFiles.length} asset(s) to server...`);
      
      let data: any = null;
      try {
        data = await uploadWithXHR(processedFiles, (pct) => {
          setUploadProgressPercent(pct);
          setUploadProgressMessage(`Uploading file(s)... ${pct}% complete`);
        });
      } catch (xhrErr: any) {
        console.warn('XHR multipart upload failed, attempting resilient base64 fallback:', xhrErr);
        setUploadProgressMessage(`Retrying upload via resilient base64 protocol...`);
        try {
          const base64Files = await Promise.all(
            processedFiles.map(async (f) => ({
              name: f.name,
              type: f.type,
              dataBase64: await fileToDataURL(f)
            }))
          );

          const res = await fetch('/api/upload-base64', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ files: base64Files })
          });

          if (res.ok) {
            data = await res.json();
          } else {
            throw new Error(`Base64 upload endpoint status ${res.status}`);
          }
        } catch (base64Err: any) {
          console.warn('Base64 upload endpoint failed, falling back to client-side data URLs:', base64Err);
          const fallbackAssets = await Promise.all(
            processedFiles.map(async (f) => {
              const dataUrl = await fileToDataURL(f);
              const isVideo = f.type.startsWith('video/') || /\.(mp4|mov|webm|m4v)$/i.test(f.name);
              return {
                url: dataUrl,
                filename: f.name,
                size: f.size,
                mimetype: f.type || 'image/jpeg',
                type: isVideo ? 'video' : 'image'
              };
            })
          );
          data = { success: true, files: fallbackAssets };
        }
      }

      if (data.success && Array.isArray(data.files)) {
        const newAssets: UploadedMediaAsset[] = data.files.map((f: any) => ({
          url: f.url,
          filename: f.filename,
          size: f.size,
          mimetype: f.mimetype,
          type: f.type,
          uploadedAt: new Date().toISOString()
        }));

        setUploadedVaultAssets((prev) => [...newAssets, ...prev]);

        // Auto-attach to target listing if provided
        const activeTargetId = targetListingId || (selectedUploadTargetListing !== 'none' ? selectedUploadTargetListing : null);
        if (activeTargetId) {
          const targetListing = listings.find((l) => l.id === activeTargetId);
          if (targetListing) {
            const newPhotoUrls = newAssets.filter((a) => a.type === 'image').map((a) => a.url);
            const firstVideo = newAssets.find((a) => a.type === 'video');

            const partialUpdate: Partial<Listing> = {};
            if (newPhotoUrls.length > 0) {
              partialUpdate.photos = [...targetListing.photos, ...newPhotoUrls];
            }
            if (firstVideo) {
              partialUpdate.videoUrl = firstVideo.url;
            }
            if (Object.keys(partialUpdate).length > 0) {
              await onUpdateListing(activeTargetId, partialUpdate);
            }
          }
        }

        // Auto-append to open listing form state for live thumbnail preview
        const newPhotoUrls = newAssets.filter((a) => a.type === 'image').map((a) => a.url);
        const firstVideoAsset = newAssets.find((a) => a.type === 'video');

        if (newPhotoUrls.length > 0) {
          setFormPhotos((prev) => (prev ? `${prev}, ${newPhotoUrls.join(', ')}` : newPhotoUrls.join(', ')));
          setIsFormDirty(true);
        }
        if (firstVideoAsset) {
          setFormVideoUrl(firstVideoAsset.url);
          setIsFormDirty(true);
        }

        setUploadProgressPercent(100);
        setUploadProgressMessage(`✓ ${processedFiles.length} file(s) uploaded and added to listing preview!`);
        setTimeout(() => {
          setUploadProgressMessage(null);
          setUploadProgressPercent(0);
        }, 3500);
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
      setUploadProgressMessage(`❌ Upload error: ${err.message || 'Server error'}`);
      setUploadProgressPercent(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddDirectImageUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const url = pastedImageUrl.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/uploads/') && !url.startsWith('data:image/')) {
      setPastedUrlSuccess('Please enter a valid photo URL (starting with http://, https://, or /uploads/).');
      return;
    }

    setFormPhotos((prev) => (prev ? `${prev}, ${url}` : url));
    setIsFormDirty(true);
    setPastedImageUrl('');
    setPastedUrlSuccess('✓ Photo URL added to gallery preview!');
    setTimeout(() => setPastedUrlSuccess(null), 3000);
  };

  const handleCopyPhotoLink = (photoUrl: string, index: number) => {
    navigator.clipboard.writeText(photoUrl);
    setCopiedPhotoIndex(index);
    setTimeout(() => setCopiedPhotoIndex(null), 2000);
  };

  // New/Edit Listing Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formCity, setFormCity] = useState('Thika');
  const [formRegion, setFormRegion] = useState('Central Texas');
  const [formAddress, setFormAddress] = useState('');
  const [formPrice, setFormPrice] = useState(250);
  const [formCleaningFee, setFormCleaningFee] = useState(60);
  const [formMaxGuests, setFormMaxGuests] = useState(4);
  const [formBedrooms, setFormBedrooms] = useState(2);
  const [formBeds, setFormBeds] = useState(2);
  const [formBaths, setFormBaths] = useState(2);
  const [formDescription, setFormDescription] = useState(DEFAULT_THIKA_COTTAGE_DESCRIPTION);
  const [formPhotos, setFormPhotos] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formHostName, setFormHostName] = useState('Madam Ann');
  const [formHostPhone, setFormHostPhone] = useState('+254 722 000 111');
  const [formAmenities, setFormAmenities] = useState('Private Pool, High-Speed Wi-Fi, Air Conditioning, BBQ Grill');

  // Room Media & Video Shot States for listing form
  const [formVideoShots, setFormVideoShots] = useState<VideoShot[]>([]);
  const [formRoomPhotos, setFormRoomPhotos] = useState<RoomPhoto[]>([]);

  // Listing Form Save, Validation & Dirty States
  const [isSavingListing, setIsSavingListing] = useState(false);
  const [listingSaveError, setListingSaveError] = useState<string | null>(null);
  const [listingSaveSuccess, setListingSaveSuccess] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Photo reordering & management helpers for open listing form
  const getPhotosArray = (): string[] => {
    return formPhotos
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    const arr = getPhotosArray();
    if (direction === 'up' && index > 0) {
      const temp = arr[index];
      arr[index] = arr[index - 1];
      arr[index - 1] = temp;
    } else if (direction === 'down' && index < arr.length - 1) {
      const temp = arr[index];
      arr[index] = arr[index + 1];
      arr[index + 1] = temp;
    }
    setFormPhotos(arr.join(', '));
  };

  const handleSetCoverPhoto = (index: number) => {
    const arr = getPhotosArray();
    if (index <= 0 || index >= arr.length) return;
    const cover = arr.splice(index, 1)[0];
    arr.unshift(cover);
    setFormPhotos(arr.join(', '));
  };

  const handleRemovePhoto = (index: number) => {
    const arr = getPhotosArray();
    arr.splice(index, 1);
    setFormPhotos(arr.join(', '));
  };

  // CMS Website Content State
  const [cmsHeroHeadline, setCmsHeroHeadline] = useState(settings.cmsContent?.heroHeadline || "Find Your Perfect Texas Escape");
  const [cmsHeroSubheadline, setCmsHeroSubheadline] = useState(settings.cmsContent?.heroSubheadline || "Handpicked ranch cabins, Austin lofts, wine country cottages & beachfront villas in Texas.");
  const [cmsAnnouncement, setCmsAnnouncement] = useState(settings.cmsContent?.announcementBar || "🔥 Special Offer: Book 3+ nights and get 10% off your Texas stay! Direct Safaricom M-Pesa & Bank Payment enabled.");
  const [cmsAnnouncementActive, setCmsAnnouncementActive] = useState(settings.cmsContent?.announcementActive ?? true);
  const [cmsPhone, setCmsPhone] = useState(settings.cmsContent?.footerContactPhone || "+254 729 110 857");
  const [cmsEmail, setCmsEmail] = useState(settings.cmsContent?.footerContactEmail || "info@texasairbnbs.com");
  const [isSavingCms, setIsSavingCms] = useState(false);

  useEffect(() => {
    if (settings.cmsContent) {
      if (settings.cmsContent.heroHeadline) setCmsHeroHeadline(settings.cmsContent.heroHeadline);
      if (settings.cmsContent.heroSubheadline) setCmsHeroSubheadline(settings.cmsContent.heroSubheadline);
      if (settings.cmsContent.announcementBar) setCmsAnnouncement(settings.cmsContent.announcementBar);
      if (settings.cmsContent.announcementActive !== undefined) setCmsAnnouncementActive(settings.cmsContent.announcementActive);
      if (settings.cmsContent.footerContactPhone) setCmsPhone(settings.cmsContent.footerContactPhone);
      if (settings.cmsContent.footerContactEmail) setCmsEmail(settings.cmsContent.footerContactEmail);
    }
  }, [settings.cmsContent]);

  // Blog Form State
  const [blogTitle, setBlogTitle] = useState('');
  const [blogSummary, setBlogSummary] = useState('');
  const [blogAuthor, setBlogAuthor] = useState('Texas Host Manager');
  const [blogCategory, setBlogCategory] = useState('Texas Travel Guide');
  const [blogImage, setBlogImage] = useState('https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80');
  const [blogContent, setBlogContent] = useState('');
  const [isBlogFormOpen, setIsBlogFormOpen] = useState(false);

  // Settings State
  const [commissionPct, setCommissionPct] = useState(settings.commissionPercentage || 12);
  const [cancel7Plus, setCancel7Plus] = useState(settings.cancellation7PlusRefund || 100);
  const [cancel3To6, setCancel3To6] = useState(settings.cancellation3To6Refund || 50);
  const [cancelUnder3, setCancelUnder3] = useState(settings.cancellationUnder3Refund || 0);
  const [referralCredit, setReferralCredit] = useState(settings.referralCreditAmount || 25);
  const [usdToKes, setUsdToKes] = useState(settings.usdToKesRate || 130);
  const [gaId, setGaId] = useState(settings.googleAnalyticsId || 'G-TEXASAIRBNBS');
  const [gscVerification, setGscVerification] = useState(settings.googleSearchConsoleVerification || 'google-site-verification=texas');
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Inline Edit Mode State
  const [isInlineEditMode, setIsInlineEditMode] = useState<boolean>(true);
  const [inlineSaveSuccess, setInlineSaveSuccess] = useState<string | null>(null);
  const [editingCardPrices, setEditingCardPrices] = useState<Record<string, number>>({});
  const [editingCardCleaningFees, setEditingCardCleaningFees] = useState<Record<string, number>>({});
  const [editingCardTitles, setEditingCardTitles] = useState<Record<string, string>>({});

  const handleInlineSave = async (id: string, partial: Partial<Listing>) => {
    try {
      await onUpdateListing(id, partial);
      setInlineSaveSuccess(id);
      setTimeout(() => setInlineSaveSuccess(null), 2500);
    } catch (err) {
      console.error('Failed to update listing inline:', err);
    }
  };

  // Totals
  const totalVolume = transactions.reduce((acc, t) => acc + (t.amount ?? 0), 0);
  const totalCommission = transactions.reduce((acc, t) => acc + (t.commissionAmount ?? (t.amount ? t.amount * 0.12 : 0)), 0);
  const pendingRequests = bookings.filter((b) => b.status === 'pending');

  // Filtered Bookings Queue
  const filteredBookings = bookings.filter((b) => {
    if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) return false;
    if (bookingSearchQuery) {
      const q = bookingSearchQuery.toLowerCase();
      return b.guestName.toLowerCase().includes(q) || b.guestPhone.includes(q) || b.listingTitle.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    }
    return true;
  });

  // Filtered Transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (txDateRange === 'all') return true;
    const txDate = tx.timestamp ? new Date(tx.timestamp) : (tx.createdAt ? new Date(tx.createdAt) : new Date());
    const now = new Date();

    if (txDateRange === 'this_month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    if (txDateRange === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
    }
    if (txDateRange === 'custom') {
      if (txCustomStart && txDate < new Date(txCustomStart)) return false;
      if (txCustomEnd && txDate > new Date(txCustomEnd + 'T23:59:59')) return false;
      return true;
    }
    return true;
  });

  const handleEditListingClick = (listing: Listing) => {
    setEditingId(listing.id);
    setFormTitle(listing.title || '');
    setFormCity(listing.city || 'Thika');
    setFormRegion(listing.region || 'Thika Region');
    setFormAddress(listing.address || '');
    setFormPrice(listing.nightlyPrice || 2500);
    setFormCleaningFee(listing.cleaningFee || 0);
    setFormMaxGuests(listing.maxGuests || 2);
    setFormBedrooms(listing.bedrooms || 1);
    setFormBeds(listing.beds || 1);
    setFormBaths(listing.baths || 1);
    setFormDescription(listing.description || '');
    setFormPhotos((listing.photos || []).join(', '));
    setFormVideoUrl(listing.videoUrl || '');
    setFormRoomPhotos(listing.roomPhotos || []);
    setFormVideoShots(listing.videoShots || []);
    setFormHostName(listing.hostName || 'Madam Ann');
    setFormHostPhone(listing.hostPhone || '+254 729 110 857');
    setFormAmenities((listing.amenities || []).join(', '));

    setListingSaveError(null);
    setListingSaveSuccess(null);
    setIsFormDirty(false);
    setIsFormOpen(true);
  };

  const handleCreateNewClick = () => {
    setEditingId(null);
    setFormTitle('');
    setFormCity('Thika');
    setFormRegion('Thika Region');
    setFormAddress('');
    setFormPrice(3500);
    setFormCleaningFee(500);
    setFormMaxGuests(4);
    setFormBedrooms(2);
    setFormBeds(2);
    setFormBaths(2);
    setFormDescription(DEFAULT_THIKA_COTTAGE_DESCRIPTION);
    setFormPhotos('https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80');
    setFormVideoUrl('');
    setFormRoomPhotos([]);
    setFormVideoShots([]);
    setFormHostName('Madam Ann');
    setFormHostPhone('+254 729 110 857');
    setFormAmenities('Private Wifi, Hot Water, Master Ensuite, Security');

    setListingSaveError(null);
    setListingSaveSuccess(null);
    setIsFormDirty(false);
    setIsFormOpen(true);
  };

  const handleCancelListingForm = () => {
    setIsFormOpen(false);
    setIsFormDirty(false);
    setListingSaveError(null);
    setListingSaveSuccess(null);
  };

  const handleSaveListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setListingSaveError(null);
    setListingSaveSuccess(null);

    // Basic Validation
    const photoArray = formPhotos
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const amenityArray = formAmenities
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const numPrice = Number(formPrice);

    if (!formTitle.trim()) {
      setListingSaveError('Listing title cannot be empty.');
      return;
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      setListingSaveError('Nightly price must be a positive number greater than 0.');
      return;
    }

    if (!formCity.trim()) {
      setListingSaveError('City / Location name cannot be empty.');
      return;
    }

    if (photoArray.length === 0) {
      setListingSaveError('At least one photo URL or image asset is required.');
      return;
    }

    const payload: Partial<Listing> = {
      title: formTitle.trim(),
      city: formCity.trim(),
      region: formRegion.trim() || 'Thika Region',
      address: formAddress.trim() || `${formCity.trim()}, Kenya`,
      nightlyPrice: numPrice,
      cleaningFee: Math.max(0, Number(formCleaningFee) || 0),
      maxGuests: Math.max(1, Number(formMaxGuests) || 1),
      bedrooms: Math.max(0, Number(formBedrooms) || 1),
      beds: Math.max(0, Number(formBeds) || 1),
      baths: Math.max(0, Number(formBaths) || 1),
      description: formDescription.trim(),
      photos: photoArray,
      videoUrl: formVideoUrl.trim(),
      roomPhotos: formRoomPhotos,
      videoShots: formVideoShots,
      hostName: formHostName.trim() || 'Madam Ann',
      hostAvatar: '/madam_ann_profile.jpg',
      hostPhone: formHostPhone.trim() || '+254 729 110 857',
      amenities: amenityArray
    };

    setIsSavingListing(true);

    try {
      if (editingId) {
        await onUpdateListing(editingId, payload);
      } else {
        await onAddListing(payload);
      }
      setIsFormDirty(false);
      setListingSaveSuccess('✓ Changes saved and live on the site! Public site & search results updated immediately.');
      setTimeout(() => {
        setIsFormOpen(false);
        setListingSaveSuccess(null);
      }, 1800);
    } catch (err: any) {
      console.error('Error saving listing:', err);
      setListingSaveError(err?.message || 'Failed to save listing changes. Edits preserved below — please try again.');
    } finally {
      setIsSavingListing(false);
    }
  };

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      cancellation7PlusRefund: Number(cancel7Plus),
      cancellation3To6Refund: Number(cancel3To6),
      cancellationUnder3Refund: Number(cancelUnder3),
      referralCreditAmount: Number(referralCredit),
      googleAnalyticsId: gaId,
      googleSearchConsoleVerification: gscVerification
    });
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // 1. FIRST LAYER OF SECURITY: Secret Access Password Gate (Pre-Admin Login)
  if (!isGateUnlocked) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
        <div className="relative bg-stone-900 text-stone-100 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 border border-stone-800 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-inner ring-4 ring-amber-500/10">
              <Key className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-500 uppercase font-bold">
                Security Gate 01 / 02
              </span>
              <h2 className="font-serif font-bold text-xl text-white mt-1">Admin Access Password Gate</h2>
              <p className="text-xs text-stone-400 mt-1">
                Restricted portal <code className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">/admin</code> — Enter secret password to unlock.
              </p>
            </div>
          </div>

          {gateError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-bold flex items-start space-x-2.5 animate-shake">
              <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{gateError}</span>
            </div>
          )}

          <form onSubmit={handleVerifyGatePassword} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-stone-300 mb-1.5">Secret Access Password</label>
              <div className="relative">
                <input
                  type={showGatePassword ? 'text' : 'password'}
                  value={gatePasswordInput}
                  onChange={(e) => setGatePasswordInput(e.target.value)}
                  className="w-full p-3.5 pr-11 rounded-xl bg-stone-950 border border-stone-700 text-white font-mono placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="••••••••••••"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowGatePassword(!showGatePassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-400 transition-colors p-1 cursor-pointer focus:outline-none"
                  title={showGatePassword ? "Hide password" : "Show password"}
                  aria-label={showGatePassword ? "Hide password" : "Show password"}
                >
                  {showGatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingGate}
              className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{isSubmittingGate ? 'Verifying Password...' : 'Verify Access Password'}</span>
            </button>
          </form>

          <div className="text-center pt-3 border-t border-stone-800/80 flex items-center justify-between">
            <span className="text-[10px] text-stone-500 font-mono">Texas Airbnbs Security Engine</span>
            <button
              onClick={onClose}
              className="text-xs text-stone-400 hover:text-stone-200 underline cursor-pointer"
            >
              Return to Guest Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. SECOND LAYER OF SECURITY: Admin Account Verification
  if (!isAdminAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
        <div className="relative bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-md w-full shadow-2xl p-6 border border-stone-200 dark:border-stone-800 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center border border-amber-500/30 shadow-inner">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-[10px] font-mono tracking-widest text-amber-600 dark:text-amber-500 uppercase font-bold">
              Security Gate 02 / 02
            </span>
            <h2 className="font-serif font-bold text-xl">Admin Account Verification</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Logged in through Password Gate. Please authenticate your administrator user credentials.
            </p>
          </div>

          {adminAuthError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center space-x-2 animate-shake">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{adminAuthError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4 text-xs font-bold">
            <div>
              <label className="block text-stone-600 dark:text-stone-300 mb-1">Admin Email Address</label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                className="w-full p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium"
                placeholder="annkungu26@gmail.com"
                required
              />
            </div>

            <div>
              <label className="block text-stone-600 dark:text-stone-300 mb-1">Admin Password</label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full p-3 pr-11 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-mono text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors p-1 cursor-pointer focus:outline-none"
                  title={showAdminPassword ? "Hide password" : "Show password"}
                  aria-label={showAdminPassword ? "Hide password" : "Show password"}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingAuth}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              <span>{isSubmittingAuth ? 'Verifying Credentials...' : 'Sign In To Admin Panel'}</span>
            </button>
          </form>

          <div className="text-center pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <button
              onClick={() => {
                sessionStorage.removeItem('tx_admin_gate_unlocked');
                sessionStorage.removeItem('tx_admin_gate_expires');
                setIsGateUnlocked(false);
              }}
              className="text-[11px] text-amber-600 hover:underline font-bold"
            >
              Lock Gate
            </button>
            <button
              onClick={onClose}
              className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 underline cursor-pointer"
            >
              Return to Guest Site
            </button>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-md flex justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 rounded-3xl max-w-6xl w-full my-auto shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl">Admin Control Panel</h2>
              <p className="text-xs text-stone-400">Texas Airbnbs Management Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAdminLogout}
              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-bold flex items-center space-x-1 transition-colors border border-stone-700 cursor-pointer"
              title="Log Out Administrator"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 px-6 pt-3 bg-stone-100 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 overflow-x-auto no-scrollbar">
          {[
            { id: 'requests', label: `Booking Requests (${pendingRequests.length})`, icon: MessageSquare },
            { id: 'listings', label: `Listings (${listings.length})`, icon: ListFilter },
            { id: 'media', label: `Media Vault (${uploadedVaultAssets.length})`, icon: UploadCloud },
            { id: 'cms', label: 'Website CMS Editor', icon: Edit2 },
            { id: 'reviews', label: `Guest Reviews (${reviewsList.length})`, icon: MessageCircle },
            { id: 'settings', label: 'Platform Settings', icon: Settings },
            { id: 'notifications', label: 'SMS/Email Logs', icon: Bell }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold rounded-t-2xl border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-stone-900 text-amber-700 dark:text-amber-400 border-amber-600 shadow-sm'
                    : 'text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* TAB: Booking Requests (Host Approval Model) */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif font-bold text-lg">Guest Booking Requests Queue</h3>
                  <p className="text-xs text-stone-500">Review guest stay details, host approval status, and Safaricom M-Pesa / Bank payment prompts.</p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={bookingSearchQuery}
                    onChange={(e) => setBookingSearchQuery(e.target.value)}
                    placeholder="Search guest or booking ID..."
                    className="p-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-medium focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
                {[
                  { id: 'all', label: `All (${bookings.length})` },
                  { id: 'pending', label: `Pending (${bookings.filter(b=>b.status==='pending').length})` },
                  { id: 'approved', label: `Approved (${bookings.filter(b=>b.status==='approved').length})` },
                  { id: 'confirmed', label: `Confirmed (${bookings.filter(b=>b.status==='confirmed').length})` },
                  { id: 'declined', label: `Declined (${bookings.filter(b=>b.status==='declined').length})` },
                  { id: 'cancelled', label: `Cancelled (${bookings.filter(b=>b.status==='cancelled').length})` }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setBookingStatusFilter(st.id as any)}
                    className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                      bookingStatusFilter === st.id
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-dashed border-stone-300 dark:border-stone-700">
                  <MessageSquare className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                  <p className="text-xs font-bold text-stone-500">No matching booking requests found.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={booking.listingPhoto ? (booking.listingPhoto.includes('images.unsplash.com') ? `${booking.listingPhoto}&auto=format&fit=crop&w=200&q=75` : booking.listingPhoto) : ''}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=75';
                          }}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm">{booking.listingTitle}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                              booking.status === 'pending'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : booking.status === 'approved'
                                ? 'bg-blue-100 text-blue-900'
                                : booking.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}>
                              {booking.status}
                            </span>
                          </div>

                          <p className="text-xs text-stone-600 dark:text-stone-300">
                            Guest: <strong className="text-stone-900 dark:text-stone-100">{booking.guestName}</strong> ({booking.guestPhone}, {booking.guestEmail})
                          </p>

                          <p className="text-xs text-stone-500">
                            {booking.checkIn} to {booking.checkOut} ({booking.nights} nights, {booking.guests} guests) • Total: <strong>KSh {booking.totalAmount.toLocaleString()}</strong>
                          </p>

                          {booking.notes && (
                            <p className="text-xs text-stone-500 italic bg-white dark:bg-stone-900 p-2 rounded-lg border border-stone-200 dark:border-stone-800">
                              "{booking.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons if pending */}
                      {booking.status === 'pending' && (
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => onUpdateBookingStatus(booking.id, 'approved')}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 shadow-md cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve Request</span>
                          </button>
                          <button
                            onClick={() => onUpdateBookingStatus(booking.id, 'declined')}
                            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center space-x-1 shadow-md cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Listings Control */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-100 dark:bg-stone-800/60 p-4 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center space-x-2">
                    <span>Manage Texas Property Listings</span>
                    {isInlineEditMode && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] uppercase tracking-wider font-extrabold border border-amber-500/30">
                        Inline Edit Active
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Quickly toggle price, availability & featured stays directly on the listing cards below.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsInlineEditMode(!isInlineEditMode)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm border cursor-pointer ${
                      isInlineEditMode
                        ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-500/30'
                        : 'bg-stone-200 dark:bg-stone-700 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <Zap className={`w-3.5 h-3.5 ${isInlineEditMode ? 'fill-current' : ''}`} />
                    <span>Inline Edit Mode: {isInlineEditMode ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={handleCreateNewClick}
                    className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Listing</span>
                  </button>
                </div>
              </div>

              {/* Add/Edit Listing Dedicated Full Overlay Modal Form */}
              {isFormOpen && (
                <div className="fixed inset-0 z-[100] bg-stone-950/85 backdrop-blur-md overflow-y-auto p-3 sm:p-6 flex items-start justify-center animate-fade-in">
                  <div className="relative w-full max-w-4xl my-4 sm:my-8 bg-stone-900 text-stone-100 rounded-3xl border border-amber-500/40 shadow-2xl overflow-hidden p-5 sm:p-8 space-y-6">
                    <form onSubmit={handleSaveListing} className="space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-4">
                        <div>
                          <h4 className="font-serif font-bold text-lg sm:text-xl text-amber-400 flex items-center space-x-2">
                            <span>{editingId ? 'Edit Property Listing' : 'Add New Property Listing'}</span>
                            {isFormDirty && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-500/30">
                                Unsaved Changes
                              </span>
                            )}
                          </h4>
                          <p className="text-xs text-stone-400 mt-0.5">
                            Full property editor — upload media directly from device gallery or camera, changes save instantly.
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-xs cursor-pointer inline-flex items-center space-x-1.5 shadow-md hover:scale-[1.02] transition-transform border border-amber-400/40">
                            <UploadCloud className="w-4 h-4" />
                            <span>Upload Device Media</span>
                            <input
                              type="file"
                              multiple
                              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                              onChange={(e) => {
                                if (e.target.files) {
                                  handleFileUpload(e.target.files, editingId || undefined);
                                  setIsFormDirty(true);
                                }
                              }}
                              className="hidden"
                            />
                          </label>

                          <button
                            type="button"
                            onClick={handleCancelListingForm}
                            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                            title="Close Form"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                  {/* Error & Success Feedback Banners */}
                  {listingSaveError && (
                    <div className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-start space-x-2.5 animate-shake">
                      <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                      <div>
                        <p className="font-extrabold text-xs">Cannot Save Listing</p>
                        <p className="font-medium text-[11px] opacity-90">{listingSaveError}</p>
                      </div>
                    </div>
                  )}

                  {listingSaveSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2.5 animate-fade-in">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{listingSaveSuccess}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">
                        Title <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => {
                          setFormTitle(e.target.value);
                          setIsFormDirty(true);
                        }}
                        placeholder="e.g. Luxury Thika Villa with Private Pool"
                        className="w-full p-3 rounded-xl bg-stone-950 text-white font-bold text-sm border-2 border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none placeholder:text-stone-500 shadow-inner transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">
                        City / Location Choice <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        list="city-options-form-edit"
                        value={formCity}
                        onChange={(e) => {
                          setFormCity(e.target.value);
                          setIsFormDirty(true);
                        }}
                        placeholder="e.g. Thika, Section 9, Nairobi..."
                        className="w-full p-3 rounded-xl bg-stone-950 text-white font-bold text-sm border-2 border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none placeholder:text-stone-500 shadow-inner transition-all"
                        required
                      />
                      <datalist id="city-options-form-edit">
                        <option value="Thika" />
                        <option value="Section 9" />
                        <option value="Thika Town Centre" />
                        <option value="Cravers Area" />
                        <option value="Landless" />
                        <option value="Chania Falls" />
                        <option value="Makongeni" />
                        <option value="Nairobi" />
                        <option value="Austin" />
                        <option value="Fredericksburg" />
                      </datalist>
                    </div>

                    <div>
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">Region / Area Tag</label>
                      <input
                        type="text"
                        value={formRegion}
                        onChange={(e) => {
                          setFormRegion(e.target.value);
                          setIsFormDirty(true);
                        }}
                        placeholder="e.g. Thika Region, Kiambu, Central"
                        className="w-full p-3 rounded-xl bg-stone-950 text-white font-bold text-sm border-2 border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none placeholder:text-stone-500 shadow-inner transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">Address / Landmark</label>
                      <input
                        type="text"
                        value={formAddress}
                        onChange={(e) => {
                          setFormAddress(e.target.value);
                          setIsFormDirty(true);
                        }}
                        placeholder="e.g. Near Cravers, Off Garissa Road"
                        className="w-full p-3 rounded-xl bg-stone-950 text-white font-bold text-sm border-2 border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none placeholder:text-stone-500 shadow-inner transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">
                        Nightly Price (KSh) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formPrice}
                        onChange={(e) => {
                          setFormPrice(Number(e.target.value));
                          setIsFormDirty(true);
                        }}
                        className="w-full p-3 rounded-xl bg-stone-950 text-amber-400 font-extrabold text-base border-2 border-amber-500/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none shadow-inner transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">Cleaning Fee (KSh)</label>
                      <input
                        type="number"
                        min="0"
                        value={formCleaningFee}
                        onChange={(e) => {
                          setFormCleaningFee(Number(e.target.value));
                          setIsFormDirty(true);
                        }}
                        className="w-full p-3 rounded-xl bg-stone-950 text-white font-bold text-sm border-2 border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none shadow-inner transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">Max Guests Capacity</label>
                      <input
                        type="number"
                        min="1"
                        value={formMaxGuests}
                        onChange={(e) => {
                          setFormMaxGuests(Number(e.target.value));
                          setIsFormDirty(true);
                        }}
                        className="w-full p-3 rounded-xl bg-stone-950 text-white font-bold text-sm border-2 border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none shadow-inner transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">Bedrooms / Beds / Baths</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={formBedrooms}
                          onChange={(e) => {
                            setFormBedrooms(Number(e.target.value));
                            setIsFormDirty(true);
                          }}
                          title="Bedrooms"
                          placeholder="Beds"
                          className="w-full p-2.5 rounded-xl bg-stone-950 text-white border-2 border-stone-700 focus:border-amber-400 text-center font-bold text-sm"
                        />
                        <input
                          type="number"
                          min="0"
                          value={formBeds}
                          onChange={(e) => {
                            setFormBeds(Number(e.target.value));
                            setIsFormDirty(true);
                          }}
                          title="Beds"
                          placeholder="Beds"
                          className="w-full p-2.5 rounded-xl bg-stone-950 text-white border-2 border-stone-700 focus:border-amber-400 text-center font-bold text-sm"
                        />
                        <input
                          type="number"
                          min="0"
                          value={formBaths}
                          onChange={(e) => {
                            setFormBaths(Number(e.target.value));
                            setIsFormDirty(true);
                          }}
                          title="Baths"
                          placeholder="Baths"
                          className="w-full p-2.5 rounded-xl bg-stone-950 text-white border-2 border-stone-700 focus:border-amber-400 text-center font-bold text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">Host Contact Name</label>
                      <input
                        type="text"
                        value={formHostName}
                        onChange={(e) => {
                          setFormHostName(e.target.value);
                          setIsFormDirty(true);
                        }}
                        className="w-full p-3 rounded-xl bg-stone-950 text-white font-bold text-sm border-2 border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none shadow-inner transition-all"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">Host Phone Number</label>
                      <input
                        type="text"
                        value={formHostPhone}
                        onChange={(e) => {
                          setFormHostPhone(e.target.value);
                          setIsFormDirty(true);
                        }}
                        className="w-full p-3 rounded-xl bg-stone-950 text-white font-bold text-sm border-2 border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none shadow-inner transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">Amenities (Comma-Separated)</label>
                    <input
                      type="text"
                      value={formAmenities}
                      onChange={(e) => {
                        setFormAmenities(e.target.value);
                        setIsFormDirty(true);
                      }}
                      placeholder="Private Pool, Wi-Fi, Air Conditioning, Hot Water, Kitchen"
                      className="w-full p-3 rounded-xl bg-stone-950 text-white font-bold text-sm border-2 border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none placeholder:text-stone-500 shadow-inner transition-all"
                    />
                  </div>

                  {/* Photo URLs & Local Device File Upload Box */}
                  <div className="space-y-3">
                    <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide">
                      Listing Photos & Media Assets <span className="text-rose-400">*</span>
                    </label>

                    {/* Drag & Drop File Input Box */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(false);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingOver(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleFileUpload(e.dataTransfer.files, editingId || undefined);
                          setIsFormDirty(true);
                        }
                      }}
                      className={`p-5 rounded-2xl border-2 border-dashed transition-all text-center space-y-2.5 ${
                        isDraggingOver
                          ? 'border-amber-400 bg-amber-500/30 scale-[1.01] shadow-xl'
                          : 'border-amber-500/60 bg-stone-950/80 hover:border-amber-400'
                      }`}
                    >
                      <div className="flex justify-center items-center space-x-2 text-amber-300">
                        <UploadCloud className="w-6 h-6 animate-bounce" />
                        <span className="font-extrabold text-sm text-amber-300">Upload Device Media (Photos & Videos)</span>
                      </div>

                      <p className="text-xs text-stone-300 font-medium max-w-md mx-auto">
                        Drag & drop files here or select directly from your phone gallery/computer. Multiple files supported in JPEG, PNG, WebP (up to 20MB) or MP4, MOV (up to 200MB).
                      </p>

                      <div className="flex items-center justify-center gap-2 pt-1">
                        <label className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-extrabold text-xs cursor-pointer inline-flex items-center space-x-2 shadow-md hover:scale-[1.02] transition-transform">
                          <UploadCloud className="w-4 h-4" />
                          <span>Choose Files from Device</span>
                          <input
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleFileUpload(e.target.files, editingId || undefined);
                                setIsFormDirty(true);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Live Upload Percentage Progress Bar */}
                      {isUploading && (
                        <div className="space-y-1.5 pt-2 max-w-sm mx-auto">
                          <div className="w-full bg-stone-800 h-2.5 rounded-full overflow-hidden border border-amber-500/40">
                            <div
                              className="bg-amber-400 h-full transition-all duration-200 rounded-full"
                              style={{ width: `${Math.max(8, uploadProgressPercent)}%` }}
                            />
                          </div>
                          <span className="text-xs font-extrabold text-amber-300">
                            {uploadProgressPercent}% Uploaded
                          </span>
                        </div>
                      )}

                      {uploadProgressMessage && (
                        <div className="text-xs font-bold text-amber-200 bg-amber-950/90 py-2 px-3 rounded-xl border border-amber-500/50 mt-2">
                          {uploadProgressMessage}
                        </div>
                      )}
                    </div>

                    {/* Side-by-Side Method 2: Direct Image URL Paste Input Box */}
                    <div className="p-4 rounded-2xl bg-stone-950/80 border-2 border-stone-800 space-y-2">
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide">
                        Or Add Photo via Direct Image URL:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={pastedImageUrl}
                          onChange={(e) => setPastedImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddDirectImageUrl(e);
                            }
                          }}
                          placeholder="Paste image URL (e.g. https://images.unsplash.com/... or /uploads/...)"
                          className="flex-1 p-3 rounded-xl bg-black border-2 border-stone-700 text-xs font-mono text-white focus:border-amber-400 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddDirectImageUrl}
                          className="px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors shadow-md"
                        >
                          Add Photo URL
                        </button>
                      </div>
                      {pastedUrlSuccess && (
                        <p className="text-xs font-bold text-emerald-400">
                          {pastedUrlSuccess}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">
                          All Photo URLs (Comma-Separated)
                        </label>
                        <textarea
                          rows={2}
                          value={formPhotos}
                          onChange={(e) => {
                            setFormPhotos(e.target.value);
                            setIsFormDirty(true);
                          }}
                          className="w-full p-3 rounded-xl bg-stone-950 text-white font-mono text-xs border-2 border-stone-700 focus:border-amber-400 focus:outline-none placeholder:text-stone-500"
                          placeholder="https://...jpg, /uploads/media-123.jpg"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide mb-1.5">
                          Main Tour Video URL
                        </label>
                        <input
                          type="text"
                          value={formVideoUrl}
                          onChange={(e) => {
                            setFormVideoUrl(e.target.value);
                            setIsFormDirty(true);
                          }}
                          className="w-full p-3 rounded-xl bg-stone-950 text-white font-mono text-xs border-2 border-stone-700 focus:border-amber-400 focus:outline-none placeholder:text-stone-500"
                          placeholder="/uploads/media-video-123.mp4 or https://..."
                        />
                      </div>
                    </div>

                    {/* Interactive Photo Reorder, Copy Link & Cover Selection Gallery */}
                    {getPhotosArray().length > 0 && (
                      <div className="space-y-2 pt-2">
                        <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide">
                          Photo Cover Order ({getPhotosArray().length} photos) — Photo #1 is Cover Photo:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          {getPhotosArray().map((photoUrl, idx) => (
                            <div
                              key={idx}
                              className={`relative rounded-xl overflow-hidden border-2 ${
                                idx === 0
                                  ? 'border-amber-400 ring-2 ring-amber-400/50'
                                  : 'border-stone-700'
                              } bg-stone-950 group`}
                            >
                              <img
                                src={photoUrl ? (photoUrl.includes('images.unsplash.com') ? `${photoUrl}&auto=format&fit=crop&w=300&q=75` : photoUrl) : ''}
                                alt={`Photo ${idx + 1}`}
                                loading="lazy"
                                decoding="async"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=75';
                                }}
                                className="w-full h-24 object-cover"
                              />
                              {idx === 0 && (
                                <span className="absolute top-1 left-1 bg-amber-400 text-stone-950 font-black text-[9px] uppercase px-2 py-0.5 rounded shadow">
                                  Cover Photo
                                </span>
                              )}

                              {/* Action controls including Copy Link */}
                              <div className="absolute inset-0 bg-stone-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-1 p-1">
                                <button
                                  type="button"
                                  onClick={() => handleCopyPhotoLink(photoUrl, idx)}
                                  className={`p-1 rounded font-bold text-[10px] flex items-center space-x-1 cursor-pointer transition-colors ${
                                    copiedPhotoIndex === idx
                                      ? 'bg-emerald-500 text-stone-950'
                                      : 'bg-stone-800 text-white hover:bg-stone-700'
                                  }`}
                                  title="Copy Photo URL Link"
                                >
                                  {copiedPhotoIndex === idx ? (
                                    <>
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>

                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleSetCoverPhoto(idx);
                                      setIsFormDirty(true);
                                    }}
                                    className="p-1 rounded bg-amber-500 text-stone-950 text-[10px] font-bold hover:bg-amber-400 cursor-pointer"
                                    title="Set as Cover Photo"
                                  >
                                    <Star className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {idx > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleMovePhoto(idx, 'up');
                                      setIsFormDirty(true);
                                    }}
                                    className="p-1 rounded bg-stone-800 text-white hover:bg-stone-700 cursor-pointer"
                                    title="Move Left/Up"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {idx < getPhotosArray().length - 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleMovePhoto(idx, 'down');
                                      setIsFormDirty(true);
                                    }}
                                    className="p-1 rounded bg-stone-800 text-white hover:bg-stone-700 cursor-pointer"
                                    title="Move Right/Down"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleRemovePhoto(idx);
                                    setIsFormDirty(true);
                                  }}
                                  className="p-1 rounded bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
                                  title="Remove Photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Room Photos & Video Shots Management */}
                  <div className="p-4 rounded-2xl bg-stone-950/80 border-2 border-stone-800 space-y-3 text-xs">
                    <h5 className="font-extrabold text-amber-300 text-xs uppercase flex items-center space-x-1.5">
                      <Image className="w-4 h-4 text-amber-400" />
                      <span>Room Shots & Video Angles ({formRoomPhotos.length} photos, {formVideoShots.length} videos)</span>
                    </h5>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Enter Room Photo URL:');
                          if (!url) return;
                          const caption = prompt('Enter Caption (e.g. Master Suite Sunset View):') || 'Room Photo';
                          const roomType = (prompt('Enter Room Type (Bedroom, Living Room, Outdoor, Pool, Kitchen, Bathroom):') || 'Bedroom') as any;
                          setFormRoomPhotos(prev => [...prev, { id: `rp-${Date.now()}`, url, caption, roomType }]);
                          setIsFormDirty(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-stone-800 text-white font-bold text-xs flex items-center space-x-1.5 hover:bg-stone-700 cursor-pointer border border-stone-700"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Add Room Photo Tag</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const title = prompt('Enter Video Shot Title:');
                          if (!title) return;
                          const videoUrl = prompt('Enter MP4 Video URL:', 'https://www.w3schools.com/html/mov_bbb.mp4') || '';
                          const angleTag = prompt('Enter Angle Tag:') || 'Best View Angle';
                          setFormVideoShots(prev => [...prev, { id: `vs-${Date.now()}`, title, videoUrl, angleTag, duration: '0:25' }]);
                          setIsFormDirty(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center space-x-1.5 hover:bg-amber-500 cursor-pointer shadow-md"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Add Video Angle</span>
                      </button>
                    </div>

                    {formRoomPhotos.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {formRoomPhotos.map((rp, idx) => (
                          <div key={rp.id} className="p-2 bg-stone-900 text-stone-100 rounded-lg border border-amber-500/40 flex items-center space-x-2 text-xs">
                            <span className="font-bold text-amber-400">[{rp.roomType}]</span>
                            <span className="truncate max-w-[140px] font-medium">{rp.caption}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormRoomPhotos(prev => prev.filter((_, i) => i !== idx));
                                setIsFormDirty(true);
                              }}
                              className="text-rose-400 font-extrabold hover:text-rose-300 cursor-pointer ml-1"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <label className="block font-bold text-amber-300 text-xs uppercase tracking-wide">
                        Property Description <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFormDescription(DEFAULT_THIKA_COTTAGE_DESCRIPTION);
                          setIsFormDirty(true);
                        }}
                        className="text-[11px] font-extrabold text-amber-300 hover:text-white bg-amber-950/90 hover:bg-amber-900 border border-amber-500/60 px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center space-x-1 shadow-sm"
                        title="Fill signature Thika cottage description"
                      >
                        <span>✨ Use Signature Thika Charm Description</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={formDescription}
                      onChange={(e) => {
                        setFormDescription(e.target.value);
                        setIsFormDirty(true);
                      }}
                      className="w-full p-3 rounded-xl bg-stone-950 text-white font-medium text-sm border-2 border-stone-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none placeholder:text-stone-500 shadow-inner"
                      placeholder="Write a welcoming property description..."
                      required
                    />
                    <p className="text-[11px] text-stone-400 mt-1 font-medium">
                      Note: The quiet charm Thika cottage description is auto-filled by default for all new listings.
                    </p>
                  </div>

                  {/* STICKY SAVE & PUBLISH ACTION BAR */}
                  <div className="sticky bottom-2 z-20 p-3.5 rounded-2xl bg-stone-900/95 dark:bg-stone-950/95 backdrop-blur-md border border-stone-700 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs mt-4">
                    <div className="flex items-center space-x-2 text-stone-300">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="font-bold text-stone-200">
                        {editingId ? 'Editing Active Listing' : 'Creating New Listing'}
                      </span>
                      {isFormDirty ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black uppercase">
                          Unsaved Edits
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                          All Changes Synced
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <button
                        type="button"
                        onClick={handleCancelListingForm}
                        disabled={isSavingListing}
                        className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSavingListing}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs flex items-center space-x-2 shadow-lg hover:shadow-amber-600/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSavingListing ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            <span>Saving & Publishing...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 text-amber-200" />
                            <span>Save Changes & Publish Live</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

              {/* Listings Cards Grid with Inline Edit Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((l) => {
                  const isAvailable = l.isAvailable !== false;
                  const currentPrice = editingCardPrices[l.id] ?? l.nightlyPrice;
                  const currentCleaning = editingCardCleaningFees[l.id] ?? l.cleaningFee;
                  const isSaved = inlineSaveSuccess === l.id;

                  return (
                    <div
                      key={l.id}
                      className={`p-4 rounded-2xl transition-all border ${
                        isSaved
                          ? 'bg-emerald-500/10 border-emerald-500/50 dark:bg-emerald-950/30'
                          : isInlineEditMode
                          ? 'bg-white dark:bg-stone-900 border-amber-500/30 dark:border-amber-700/50 shadow-sm'
                          : 'bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-800'
                      }`}
                    >
                      {/* Listing Header Row */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="relative">
                            <img
                              src={l.photos[0] ? (l.photos[0].includes('images.unsplash.com') ? `${l.photos[0]}&auto=format&fit=crop&w=200&q=75` : l.photos[0]) : ''}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=200&q=75';
                              }}
                              className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200 dark:border-stone-700"
                            />
                            {l.isFeatured && (
                              <span className="absolute -top-1.5 -right-1.5 p-1 bg-amber-500 text-stone-950 rounded-full shadow" title="Featured Stay">
                                <Star className="w-3 h-3 fill-stone-950" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm truncate text-stone-900 dark:text-stone-100">{l.title}</h4>
                            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center space-x-1.5 mt-0.5">
                              <span>{l.city}, TX</span>
                              <span>•</span>
                              <span>Host: {l.hostName}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            onClick={() => handleEditListingClick(l)}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
                            title="Full Edit Form"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteListing(l.id)}
                            className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-200 transition-colors cursor-pointer"
                            title="Delete Listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Inline Edit Controls Section */}
                      {isInlineEditMode ? (
                        <div className="pt-3 space-y-3">
                          {/* Title Quick Edit Input */}
                          <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-700 shadow-sm">
                            <label className="block text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1">
                              Listing Title Quick Edit
                            </label>
                            <div className="flex items-center space-x-1">
                              <input
                                type="text"
                                defaultValue={l.title}
                                key={`title-${l.id}-${l.title}`}
                                onBlur={(e) => {
                                  const val = e.target.value.trim();
                                  if (val && val !== l.title) {
                                    handleInlineSave(l.id, { title: val });
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value.trim();
                                    if (val && val !== l.title) {
                                      handleInlineSave(l.id, { title: val });
                                    }
                                  }
                                }}
                                className="w-full bg-black border border-stone-600 rounded-lg px-2.5 py-1.5 font-extrabold text-xs text-white focus:outline-none focus:border-amber-400"
                                placeholder="Listing Title..."
                              />
                            </div>
                          </div>

                          {/* Row 1: Price and Cleaning Fee Quick Inputs */}
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-700 shadow-sm">
                              <label className="block text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1">
                                Nightly Price (KSh)
                              </label>
                              <div className="flex items-center space-x-1">
                                <span className="font-extrabold text-amber-400 text-xs">KSh</span>
                                <input
                                  type="number"
                                  value={currentPrice}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setEditingCardPrices((prev) => ({ ...prev, [l.id]: val }));
                                  }}
                                  onBlur={() => {
                                    if (currentPrice !== l.nightlyPrice) {
                                      handleInlineSave(l.id, { nightlyPrice: currentPrice });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleInlineSave(l.id, { nightlyPrice: currentPrice });
                                    }
                                  }}
                                  className="w-full bg-black border border-stone-600 rounded-lg px-2 py-1 font-extrabold text-amber-300 text-xs focus:outline-none focus:border-amber-400"
                                />
                                {currentPrice !== l.nightlyPrice && (
                                  <button
                                    onClick={() => handleInlineSave(l.id, { nightlyPrice: currentPrice })}
                                    className="p-1 rounded bg-emerald-500 text-stone-950 font-black text-[10px] hover:bg-emerald-400 cursor-pointer"
                                    title="Save Price"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-700 shadow-sm">
                              <label className="block text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1">
                                Cleaning Fee (KSh)
                              </label>
                              <div className="flex items-center space-x-1">
                                <span className="font-extrabold text-stone-400 text-xs">KSh</span>
                                <input
                                  type="number"
                                  value={currentCleaning}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setEditingCardCleaningFees((prev) => ({ ...prev, [l.id]: val }));
                                  }}
                                  onBlur={() => {
                                    if (currentCleaning !== l.cleaningFee) {
                                      handleInlineSave(l.id, { cleaningFee: currentCleaning });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleInlineSave(l.id, { cleaningFee: currentCleaning });
                                    }
                                  }}
                                  className="w-full bg-black border border-stone-600 rounded-lg px-2 py-1 font-extrabold text-white text-xs focus:outline-none focus:border-amber-400"
                                />
                                {currentCleaning !== l.cleaningFee && (
                                  <button
                                    onClick={() => handleInlineSave(l.id, { cleaningFee: currentCleaning })}
                                    className="p-1 rounded bg-emerald-500 text-stone-950 font-black text-[10px] hover:bg-emerald-400 cursor-pointer"
                                    title="Save Cleaning Fee"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Row 2: Availability & Featured Toggles & City */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                            {/* Availability Toggle */}
                            <button
                              onClick={() => handleInlineSave(l.id, { isAvailable: !isAvailable })}
                              className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded-xl font-extrabold flex items-center justify-center space-x-1.5 transition-all border cursor-pointer ${
                                isAvailable
                                  ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900'
                                  : 'bg-rose-950 border-rose-500/60 text-rose-300 hover:bg-rose-900'
                              }`}
                              title="Toggle Property Availability"
                            >
                              {isAvailable ? (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>🟢 Bookable</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5 text-rose-400" />
                                  <span>🔴 Unavailable</span>
                                </>
                              )}
                            </button>

                            {/* Featured Toggle */}
                            <button
                              onClick={() => handleInlineSave(l.id, { isFeatured: !l.isFeatured })}
                              className={`py-1.5 px-3 rounded-xl font-extrabold flex items-center space-x-1 transition-all border cursor-pointer ${
                                l.isFeatured
                                  ? 'bg-amber-950 border-amber-500/80 text-amber-300'
                                  : 'bg-stone-900 border-stone-700 text-stone-400 hover:text-white'
                              }`}
                              title="Toggle Featured Status"
                            >
                              <Star className={`w-3.5 h-3.5 ${l.isFeatured ? 'fill-amber-400 text-amber-400' : ''}`} />
                              <span>{l.isFeatured ? 'Featured' : 'Standard'}</span>
                            </button>

                            {/* City Editable Input */}
                            <div className="flex items-center space-x-1.5 bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-1">
                              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">City:</span>
                              <input
                                type="text"
                                list="city-options-inline"
                                defaultValue={l.city}
                                key={`city-${l.id}-${l.city}`}
                                onBlur={(e) => {
                                  const val = e.target.value.trim();
                                  if (val && val !== l.city) {
                                    handleInlineSave(l.id, { city: val });
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value.trim();
                                    if (val && val !== l.city) {
                                      handleInlineSave(l.id, { city: val });
                                    }
                                  }
                                }}
                                className="bg-black border border-stone-600 rounded-lg px-2 py-0.5 text-xs font-extrabold text-white w-28 sm:w-36 focus:outline-none focus:border-amber-400"
                                placeholder="City name..."
                              />
                              <datalist id="city-options-inline">
                                <option value="Thika" />
                                <option value="Section 9" />
                                <option value="Thika Town Centre" />
                                <option value="Cravers Area" />
                                <option value="Landless" />
                                <option value="Chania Falls" />
                                <option value="Makongeni" />
                                <option value="Nairobi" />
                              </datalist>
                            </div>
                          </div>

                          {/* Save Notification Toast */}
                          {isSaved && (
                            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg flex items-center justify-between border border-emerald-300 dark:border-emerald-800">
                              <span className="flex items-center space-x-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Saved changes via PUT /api/listings/{l.id}</span>
                              </span>
                              <span className="text-[9px] uppercase font-extrabold text-emerald-600">200 OK</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Standard View Summary */
                        <div className="pt-2 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                          <div>
                            <strong>${l.nightlyPrice}</strong>/night • Clean Fee: ${l.cleaningFee}
                          </div>
                          <div className="flex items-center space-x-2">
                            {isAvailable ? (
                              <span className="text-emerald-600 font-bold text-[11px]">🟢 Available</span>
                            ) : (
                              <span className="text-rose-600 font-bold text-[11px]">🔴 Unavailable</span>
                            )}
                            {l.isFeatured && (
                              <span className="text-amber-600 font-bold text-[11px]">⭐ Featured</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: Media Upload Vault */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200 dark:border-stone-800">
                <div>
                  <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                    <UploadCloud className="w-5 h-5 text-amber-600" />
                    <span>Media Upload Vault & Storage Bucket</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Upload multiple high-resolution photos and property tour videos via multipart/form-data. Attach directly to Texas listings dynamically.
                  </p>
                </div>

                {/* Target Listing Selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-stone-600 dark:text-stone-400 shrink-0">Auto-Attach to:</span>
                  <select
                    value={selectedUploadTargetListing}
                    onChange={(e) => setSelectedUploadTargetListing(e.target.value)}
                    className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200"
                  >
                    <option value="none">General Media Vault (Unassigned)</option>
                    {listings.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.title} ({l.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-File Upload Dropzone */}
              <div className="p-6 rounded-3xl border-2 border-dashed border-amber-500/50 dark:border-amber-700/60 bg-amber-500/5 dark:bg-amber-950/20 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <UploadCloud className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Select or Drop Property Photos & Tour Videos
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
                    Supports multiple selection: JPG, PNG, WEBP, HEIC, MP4, MOV, WEBM (Up to 100MB per file).
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <label className="px-5 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer transition-all">
                    <FolderPlus className="w-4 h-4" />
                    <span>Choose Multiple Files</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFileUpload(e.target.files);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadProgressMessage && (
                  <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-bold text-xs animate-fade-in max-w-lg mx-auto">
                    {uploadProgressMessage}
                  </div>
                )}
              </div>

              {/* Asset Storage Vault Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Stored Media Assets ({uploadedVaultAssets.length})
                  </h4>
                  {copiedUrl && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800 animate-fade-in">
                      ✓ Copied URL: {copiedUrl}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {uploadedVaultAssets.map((asset, idx) => {
                    const isVideo = asset.type === 'video' || asset.mimetype?.startsWith('video/');
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-3 shadow-sm hover:border-amber-500/50 transition-all"
                      >
                        <div className="relative rounded-xl overflow-hidden bg-black/10 aspect-video flex items-center justify-center">
                          {isVideo ? (
                            <video
                              src={asset.url}
                              controls
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <img
                              src={asset.url ? (asset.url.includes('images.unsplash.com') ? `${asset.url}&auto=format&fit=crop&w=300&q=75` : asset.url) : ''}
                              alt={asset.filename}
                              loading="lazy"
                              decoding="async"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=75';
                              }}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          )}

                          <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shadow ${
                            isVideo ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'
                          }`}>
                            {isVideo ? '🎥 Video' : '📸 Image'}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-stone-900 dark:text-stone-100 truncate" title={asset.filename}>
                            {asset.filename}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center justify-between font-mono">
                            <span>{(asset.size / (1024 * 1024)).toFixed(2)} MB</span>
                            <span>{new Date(asset.uploadedAt).toLocaleDateString()}</span>
                          </p>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] font-bold">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(asset.url);
                              setCopiedUrl(asset.url);
                              setTimeout(() => setCopiedUrl(null), 2500);
                            }}
                            className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-200 flex items-center justify-center space-x-1 cursor-pointer"
                            title="Copy Asset URL"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy URL</span>
                          </button>

                          <button
                            onClick={() => {
                              const targetId = prompt(
                                `Enter Property ID to attach this asset to:\n\n` +
                                listings.map((l) => `${l.id}: ${l.title}`).join('\n')
                              );
                              if (targetId) {
                                const target = listings.find((l) => l.id === targetId);
                                if (target) {
                                  if (isVideo) {
                                    onUpdateListing(targetId, { videoUrl: asset.url });
                                  } else {
                                    onUpdateListing(targetId, { photos: [...target.photos, asset.url] });
                                  }
                                  alert(`Attached asset to ${target.title}!`);
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg bg-amber-700 text-white hover:bg-amber-800 flex items-center justify-center space-x-1 cursor-pointer"
                            title="Attach to Listing"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Attach</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Guest Reviews Manager */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-amber-600" />
                    <span>Guest Reviews & Rating Manager</span>
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Edit guest comments, adjust star ratings, or delete spam reviews live across all Texas properties.
                  </p>
                </div>
                <button
                  onClick={fetchReviews}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Reviews</span>
                </button>
              </div>

              {reviewsList.length === 0 ? (
                <p className="text-xs text-stone-500 py-8 text-center">No property reviews recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {reviewsList.map((rev) => {
                    const listing = listings.find((l) => l.id === rev.listingId);
                    const isEditing = editingReviewId === rev.id;

                    return (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-stone-900 dark:text-stone-100">{rev.userName}</span>
                              <span className="text-xs text-stone-400">•</span>
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                                Stay: {listing ? listing.title : rev.listingId}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-400">{rev.date || 'Verified Stay'}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                if (isEditing) {
                                  setEditingReviewId(null);
                                } else {
                                  setEditingReviewId(rev.id);
                                  setEditingReviewComment(rev.comment);
                                  setEditingReviewRating(rev.rating);
                                }
                              }}
                              className="p-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteReview(rev.id)}
                              className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
                              title="Delete Review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Review Content View / Edit Mode */}
                        {isEditing ? (
                          <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-amber-500/40 space-y-3 text-xs">
                            <div className="flex items-center space-x-3">
                              <label className="font-bold text-stone-600 dark:text-stone-300">Rating:</label>
                              <select
                                value={editingReviewRating}
                                onChange={(e) => setEditingReviewRating(Number(e.target.value))}
                                className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 font-bold text-amber-600"
                              >
                                <option value={5}>⭐⭐⭐⭐⭐ (5.0 Excellent)</option>
                                <option value={4}>⭐⭐⭐⭐ (4.0 Very Good)</option>
                                <option value={3}>⭐⭐⭐ (3.0 Average)</option>
                                <option value={2}>⭐⭐ (2.0 Below Average)</option>
                                <option value={1}>⭐ (1.0 Poor)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block font-bold text-stone-600 dark:text-stone-300 mb-1">Comment Text:</label>
                              <textarea
                                rows={3}
                                value={editingReviewComment}
                                onChange={(e) => setEditingReviewComment(e.target.value)}
                                className="w-full p-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-normal"
                              />
                            </div>

                            <button
                              onClick={() => handleUpdateReview(rev.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer shadow-sm"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Save Review Updates</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`}
                                />
                              ))}
                              <span className="font-bold text-stone-700 dark:text-stone-300 text-xs ml-1">{rev.rating}.0</span>
                            </div>
                            <p className="text-xs text-stone-700 dark:text-stone-300 italic">"{rev.comment}"</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB: Website CMS Editor */}
          {activeTab === 'cms' && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingCms(true);
                setSettingsSavedMessage(false);
                try {
                  await onSaveSettings({
                    cmsContent: {
                      siteTitle: settings.cmsContent?.siteTitle || 'Texas Airbnbs',
                      heroHeadline: cmsHeroHeadline,
                      heroSubheadline: cmsHeroSubheadline,
                      announcementBar: cmsAnnouncement,
                      announcementActive: cmsAnnouncementActive,
                      footerContactPhone: cmsPhone,
                      footerContactEmail: cmsEmail
                    }
                  });
                  setSettingsSavedMessage(true);
                  setTimeout(() => setSettingsSavedMessage(false), 3500);
                } catch (err) {
                  console.error('Failed to publish CMS website changes:', err);
                } finally {
                  setIsSavingCms(false);
                }
              }}
              className="space-y-6 max-w-3xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg">Website Content CMS Editor</h3>
                  <p className="text-xs text-stone-500">Edit headlines, announcement bar, hero text, and contact information live across the platform.</p>
                </div>
                {settingsSavedMessage && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 px-3.5 py-1.5 rounded-full animate-fade-in flex items-center space-x-1.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Published Live to Website!</span>
                  </span>
                )}
              </div>

              <div className="space-y-4 text-xs font-bold">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-stone-700 dark:text-stone-200 font-bold">Top Announcement Bar Text</label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <span className="text-[11px] font-medium text-stone-500">Active Bar</span>
                      <input
                        type="checkbox"
                        checked={cmsAnnouncementActive}
                        onChange={(e) => setCmsAnnouncementActive(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={cmsAnnouncement}
                    onChange={(e) => setCmsAnnouncement(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-medium text-stone-800 dark:text-stone-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1">Homepage Hero Headline</label>
                  <input
                    type="text"
                    value={cmsHeroHeadline}
                    onChange={(e) => setCmsHeroHeadline(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-stone-600 dark:text-stone-300 mb-1">Homepage Hero Subheadline</label>
                  <textarea
                    rows={2}
                    value={cmsHeroSubheadline}
                    onChange={(e) => setCmsHeroSubheadline(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-normal"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 mb-1">Support Contact Phone</label>
                    <input
                      type="text"
                      value={cmsPhone}
                      onChange={(e) => setCmsPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 dark:text-stone-300 mb-1">Support Contact Email</label>
                    <input
                      type="text"
                      value={cmsEmail}
                      onChange={(e) => setCmsEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingCms}
                className="px-6 py-3.5 rounded-2xl bg-amber-700 hover:bg-amber-800 active:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs flex items-center space-x-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                {isSavingCms ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Live Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Publish CMS Website Changes</span>
                  </>
                )}
              </button>
            </form>
          )}



          {/* TAB: Platform Settings */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSavePlatformSettings} className="space-y-6 max-w-2xl">
              <h3 className="font-serif font-bold text-lg">Global Platform Settings</h3>

              {settingsSavedMessage && (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Platform settings saved!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div>
                  <label className="block text-stone-600 mb-1">Referral Guest Credit (KSh)</label>
                  <input
                    type="number"
                    value={referralCredit}
                    onChange={(e) => setReferralCredit(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-stone-600 mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    value={gaId}
                    onChange={(e) => setGaId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 font-mono"
                  />
                </div>
              </div>

              {/* Cancellation Policy Thresholds */}
              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-stone-800/80 space-y-3">
                <h4 className="font-bold text-xs text-amber-800 dark:text-amber-400">
                  Platform Cancellation Policy Thresholds (%)
                </h4>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">7+ Days Refund %</label>
                    <input
                      type="number"
                      value={cancel7Plus}
                      onChange={(e) => setCancel7Plus(Number(e.target.value))}
                      className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">3–6 Days Refund %</label>
                    <input
                      type="number"
                      value={cancel3To6}
                      onChange={(e) => setCancel3To6(Number(e.target.value))}
                      className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">&lt; 3 Days Refund %</label>
                    <input
                      type="number"
                      value={cancelUnder3}
                      onChange={(e) => setCancelUnder3(Number(e.target.value))}
                      className="w-full p-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 font-bold"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Platform Settings</span>
              </button>
            </form>
          )}

          {/* TAB: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg">SMS & Email Dispatch Logs</h3>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 text-xs font-mono flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold uppercase text-amber-700 dark:text-amber-400 mr-2">[{n.type}]</span>
                      <span className="text-stone-900 dark:text-stone-100">{n.message}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 flex-shrink-0 ml-4">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
