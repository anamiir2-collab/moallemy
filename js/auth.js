/* =========================================================
   مُعلّمي - Authentication
   Supabase + Phone + PIN
   ========================================================= */

'use strict';

const Auth = (() => {

  // =======================================================
  // Helpers
  // =======================================================

  function getSupabase() {
    if (!window.supabaseClient) {
      console.error('Supabase client غير متوفر');
      return null;
    }

    return window.supabaseClient;
  }

  function normalizePhone(phone) {
    return String(phone || '')
      .replace(/\D/g, '')
      .trim();
  }

  function phoneToAuthEmail(phone) {
    const cleanPhone = normalizePhone(phone);
    return `${cleanPhone}@moallemy.app`;
  }

  function getInitials(name) {
    const cleanName = String(name || '').trim();

    if (!cleanName) return 'م';

    const parts = cleanName.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].charAt(0);
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    );
  }

  function isValidPhone(phone) {
    const cleanPhone = normalizePhone(phone);

    return /^01[0125][0-9]{8}$/.test(cleanPhone);
  }

  function isValidPin(pin) {
    return /^\d{4,6}$/.test(String(pin || ''));
  }

  function showMessage(message, type = 'error') {
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
      return;
    }

    if (typeof window.toast === 'function') {
      window.toast(message, type);
      return;
    }

    alert(message);
  }

  function setButtonLoading(button, loading, loadingText = 'جاري التنفيذ...') {
    if (!button) return;

    if (loading) {
      button.dataset.originalText = button.textContent;
      button.textContent = loadingText;
      button.disabled = true;
      button.classList.add('loading');
    } else {
      button.textContent =
        button.dataset.originalText || button.textContent;

      button.disabled = false;
      button.classList.remove('loading');
    }
  }

  // =======================================================
  // Teacher Cache
  // =======================================================

  function saveTeacher(teacher) {
    try {
      if (
        window.Storage &&
        window.Storage.KEYS &&
        window.Storage.KEYS.teacher
      ) {
        window.Storage.set(
          window.Storage.KEYS.teacher,
          teacher
        );
      }
    } catch (error) {
      console.warn('تعذر حفظ بيانات المدرس محليًا:', error);
    }
  }

  function getCachedTeacher() {
    try {
      if (
        window.Storage &&
        window.Storage.KEYS &&
        window.Storage.KEYS.teacher
      ) {
        return window.Storage.get(
          window.Storage.KEYS.teacher
        );
      }
    } catch (error) {
      console.warn('تعذر قراءة بيانات المدرس:', error);
    }

    return null;
  }

  function clearTeacher() {
    try {
      if (
        window.Storage &&
        window.Storage.KEYS &&
        window.Storage.KEYS.teacher
      ) {
        window.Storage.remove(
          window.Storage.KEYS.teacher
        );
      }
    } catch (error) {
      console.warn('تعذر حذف بيانات المدرس:', error);
    }
  }

  // =======================================================
  // Convert Supabase User → Teacher
  // =======================================================

  function userToTeacher(user) {
    if (!user) return null;

    const metadata = user.user_metadata || {};

    return {
      id: user.id,

      name: metadata.name || 'المدرس',

      subject: metadata.subject || '',

      stage: metadata.stage || '',

      governorate: metadata.govern