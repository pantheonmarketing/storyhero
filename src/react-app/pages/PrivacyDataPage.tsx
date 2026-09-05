import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, ChevronLeft, Copy, LockKeyhole, ShieldCheck, Trash2, Unlink } from 'lucide-react';
import { api, Child } from '../api';
import { useAuth } from '../auth';
import { useLang } from '../i18n';

type DeleteTarget = { kind: 'child'; child: Child } | { kind: 'account' } | null;

export function PrivacyDataPage() {
  const { lang } = useLang();
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[] | null>(null);
  const [target, setTarget] = useState<DeleteTarget>(null);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isOwner = user?.email.toLowerCase() === 'yoniwe@gmail.com';

  useEffect(() => { api.children().then(setChildren).catch((e) => setError(e.message)); }, []);

  const closeModal = () => { if (!busy) { setTarget(null); setConfirmation(''); setError(''); } };
  const confirmDelete = async () => {
    if (!target || confirmation !== 'DELETE') return;
    setBusy(true); setError('');
    try {
      if (target.kind === 'child') {
        await api.deleteChild(target.child.id, confirmation);
        setChildren((items) => (items || []).filter((child) => child.id !== target.child.id));
        setBusy(false); setTarget(null); setConfirmation('');
      } else {
        await api.deleteAccount(confirmation);
        window.location.assign('/');
      }
    } catch (e: any) { setError(e.message); setBusy(false); }
  };

  return (
    <main className="privacy-page container">
      <Link className="back-link" to="/app"><ChevronLeft size={17} /> {lang === 'th' ? 'กลับไปชั้นหนังสือ' : 'Back to my library'}</Link>
      <div className="privacy-title">
        <span><ShieldCheck size={30} /></span>
        <div><h1>{lang === 'th' ? 'ความเป็นส่วนตัวและข้อมูล' : 'Privacy & data'}</h1><p>{lang === 'th' ? 'คุณควบคุมรูป หนังสือ และการแชร์ของครอบครัว' : 'You control your family’s photos, books, and sharing.'}</p></div>
      </div>

      <section className="privacy-status-card">
        <LockKeyhole size={24} />
        <div><strong>{lang === 'th' ? 'เป็นส่วนตัวโดยค่าเริ่มต้น' : 'Private by default'}</strong><p>{lang === 'th' ? 'รูปต้นฉบับของเด็กเปิดได้เฉพาะบัญชีคุณ หนังสือใหม่จะไม่เปิดเผยต่อสาธารณะจนกว่าคุณจะเปิดลิงก์ครอบครัว' : 'Original child photos are only available to your account. New books stay private until you turn on a family link.'}</p></div>
        <span className="safe-pill"><Check size={14} /> {lang === 'th' ? 'เปิดใช้งาน' : 'Protected'}</span>
      </section>

      <section className="privacy-section">
        <div className="section-heading"><div><h2>{lang === 'th' ? 'ข้อมูลเด็ก' : 'Your children'}</h2><p>{lang === 'th' ? 'ลบโปรไฟล์เพื่อเอารูป ตัวละคร หนังสือ ภาพ และเสียงทั้งหมดของเด็กคนนั้นออกถาวร' : 'Deleting a profile permanently removes its original photo, hero, books, images, and audio.'}</p></div></div>
        <div className="child-data-list">
          {children === null && <div className="privacy-loading"><div className="spinner" /></div>}
          {children?.length === 0 && <p className="muted-copy">{lang === 'th' ? 'ยังไม่มีโปรไฟล์เด็ก' : 'No child profiles yet.'}</p>}
          {children?.map((child) => (
            <div className="child-data-row" key={child.id}>
              <img src={child.hero_url || child.photo_url} alt="" />
              <div><strong>{child.name}</strong><span>{child.age} {lang === 'th' ? 'ปี' : 'years old'}</span></div>
              <button className="danger-link" onClick={() => { setTarget({ kind: 'child', child }); setConfirmation(''); setError(''); }}><Trash2 size={16} /> {lang === 'th' ? 'ลบข้อมูลเด็ก' : 'Delete child data'}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="privacy-section">
        <div className="sharing-explainer">
          <div><h2>{lang === 'th' ? 'การแชร์กับครอบครัว' : 'Family sharing'}</h2><p>{lang === 'th' ? 'เปิดลิงก์จากหน้าหนังสือเมื่อคุณต้องการแชร์ คนที่มีลิงก์จะอ่านได้โดยไม่ต้องเข้าสู่ระบบ และคุณหยุดแชร์ได้ทุกเมื่อ' : 'Turn on a link from a book only when you want to share it. Anyone with that link can read without signing in, and you can stop sharing at any time.'}</p></div>
          <div className="share-state-demo"><span><LockKeyhole size={17} /> {lang === 'th' ? 'ส่วนตัว' : 'Private'}</span><strong>→</strong><span className="active"><Copy size={17} /> {lang === 'th' ? 'เปิดลิงก์ครอบครัว' : 'Family link active'}</span><button type="button"><Unlink size={15} /> {lang === 'th' ? 'หยุดแชร์' : 'Stop sharing'}</button></div>
        </div>
      </section>

      <section className="privacy-section danger-zone">
        <div><h2>{lang === 'th' ? 'ข้อมูลบัญชี' : 'Account data'}</h2><p>{lang === 'th' ? 'ลบบัญชีเพื่อเอาข้อมูลเด็ก หนังสือ ไฟล์สื่อ ประวัติเครดิต และเซสชันทั้งหมดออกถาวร การดำเนินการนี้ย้อนกลับไม่ได้' : 'Delete your account to permanently remove all child data, books, media files, credit history, and sessions. This cannot be undone.'}</p></div>
        <button className="btn-danger-outline" disabled={isOwner} onClick={() => { setTarget({ kind: 'account' }); setConfirmation(''); setError(''); }}><Trash2 size={17} /> {lang === 'th' ? 'ลบบัญชี' : 'Delete account'}</button>
        {isOwner && <small>{lang === 'th' ? 'บัญชีเจ้าของระบบป้องกันการลบด้วยตนเอง' : 'The system owner account is protected from self-deletion.'}</small>}
      </section>

      <footer className="privacy-footer"><Link to="/privacy">{lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy policy'}</Link><Link to="/terms">{lang === 'th' ? 'ข้อกำหนด' : 'Terms'}</Link><Link to="/contact">{lang === 'th' ? 'ติดต่อ' : 'Contact'}</Link></footer>

      {target && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <span className="delete-dialog-icon"><AlertTriangle size={25} /></span>
            <h2 id="delete-title">{target.kind === 'child' ? (lang === 'th' ? `ลบข้อมูลของ ${target.child.name}?` : `Delete ${target.child.name}’s data?`) : (lang === 'th' ? 'ลบบัญชีของคุณ?' : 'Delete your account?')}</h2>
            <p>{lang === 'th' ? 'ระบบจะลบข้อมูลและไฟล์ที่เกี่ยวข้องถาวร การดำเนินการนี้ย้อนกลับไม่ได้' : 'The related data and files will be permanently deleted. This cannot be undone.'}</p>
            <label htmlFor="delete-confirm">{lang === 'th' ? 'พิมพ์ DELETE เพื่อยืนยัน' : 'Type DELETE to confirm'}</label>
            <input id="delete-confirm" className="input" autoFocus value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="DELETE" />
            {error && <div className="error-message">{error}</div>}
            <div className="dialog-actions"><button className="btn btn-secondary" disabled={busy} onClick={closeModal}>{lang === 'th' ? 'ยกเลิก' : 'Cancel'}</button><button className="btn btn-danger" disabled={busy || confirmation !== 'DELETE'} onClick={confirmDelete}><Trash2 size={16} /> {busy ? (lang === 'th' ? 'กำลังลบ...' : 'Deleting...') : (lang === 'th' ? 'ลบถาวร' : 'Delete permanently')}</button></div>
          </div>
        </div>
      )}
    </main>
  );
}
