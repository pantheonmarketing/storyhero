import { Link } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';
import { useLang } from '../i18n';

export function LegalPage({ page }: { page: 'privacy' | 'terms' | 'contact' }) {
  const { lang } = useLang();
  const th = lang === 'th';
  const title = page === 'privacy' ? (th ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy') : page === 'terms' ? (th ? 'ข้อกำหนดการใช้งาน' : 'Terms of Use') : (th ? 'ติดต่อ StoryHero' : 'Contact StoryHero');
  return (
    <main className="legal-page container">
      <div className="legal-hero"><ShieldCheck size={30} /><div><h1>{title}</h1><p>{th ? 'อัปเดตล่าสุด 5 กันยายน 2026' : 'Last updated September 5, 2026'}</p></div></div>
      {page === 'privacy' && (th ? <ThaiPrivacy /> : <EnglishPrivacy />)}
      {page === 'terms' && (th ? <ThaiTerms /> : <EnglishTerms />)}
      {page === 'contact' && <section className="legal-card contact-card"><Mail size={28} /><h2>{th ? 'เรายินดีช่วยเหลือ' : 'We’re here to help'}</h2><p>{th ? 'หากมีคำถามเกี่ยวกับบัญชี ข้อมูลเด็ก การลบข้อมูล หรือการใช้งาน กรุณาส่งอีเมลหาเรา' : 'For questions about your account, child data, deletion, or using StoryHero, email us.'}</p><a className="btn btn-primary" href="mailto:hello@theaiceos.com">hello@theaiceos.com</a></section>}
      <footer className="privacy-footer"><Link to="/">StoryHero</Link><Link to="/privacy">{th ? 'ความเป็นส่วนตัว' : 'Privacy'}</Link><Link to="/terms">{th ? 'ข้อกำหนด' : 'Terms'}</Link><Link to="/contact">{th ? 'ติดต่อ' : 'Contact'}</Link></footer>
    </main>
  );
}

function EnglishPrivacy() { return <div className="legal-stack">
  <section className="legal-card"><h2>Who StoryHero is for</h2><p>StoryHero is an adult, parent, and legal-guardian service. A child should not create an account or upload personal information directly.</p></section>
  <section className="legal-card"><h2>What we collect</h2><p>We collect the parent’s email; a child’s chosen name or nickname, age, gender selection, and uploaded photo; story choices and prompts; and the generated character, book images, text, and optional narration. We also store essential account, security, and credit records.</p></section>
  <section className="legal-card"><h2>How we use and share data</h2><p>We use this information only to authenticate the parent, create and deliver the requested storybook, prevent abuse, and support the service. Cloudflare provides hosting, database, and storage; Google Gemini and/or Higgsfield process prompts and reference images for generation; Resend delivers login and book-ready emails. Their handling is governed by their own service terms.</p></section>
  <section className="legal-card"><h2>Private by default</h2><p>Original child photos are private and require the parent’s signed-in account. New generated books are private by default. A parent may deliberately enable a family link; anyone who receives that link can read the book until the parent turns sharing off. A book appears in the public showcase only through a separate owner-curated permission.</p></section>
  <section className="legal-card"><h2>Retention and your choices</h2><p>We keep account and story data until the parent deletes a child profile or the account, unless a limited record must be retained for security or legal reasons. Deletion removes StoryHero’s database records and owned media files. To access, correct, object to, or request help with your data, email <a href="mailto:hello@theaiceos.com">hello@theaiceos.com</a>.</p></section>
</div>; }

function ThaiPrivacy() { return <div className="legal-stack">
  <section className="legal-card"><h2>StoryHero เหมาะสำหรับใคร</h2><p>StoryHero เป็นบริการสำหรับผู้ใหญ่ พ่อแม่ และผู้ปกครองตามกฎหมาย เด็กไม่ควรสร้างบัญชีหรืออัปโหลดข้อมูลส่วนตัวด้วยตนเอง</p></section>
  <section className="legal-card"><h2>ข้อมูลที่เราเก็บ</h2><p>เราเก็บอีเมลของผู้ปกครอง ชื่อหรือชื่อเล่น อายุ เพศที่เลือก และรูปของเด็ก ตัวเลือกและแนวคิดนิทาน รวมถึงตัวละคร ภาพ ข้อความ และเสียงอ่านที่ระบบสร้าง ตลอดจนข้อมูลบัญชี ความปลอดภัย และเครดิตที่จำเป็น</p></section>
  <section className="legal-card"><h2>การใช้และส่งข้อมูล</h2><p>เราใช้ข้อมูลเพื่อยืนยันตัวผู้ปกครอง สร้างและส่งมอบหนังสือ ป้องกันการใช้งานผิดวัตถุประสงค์ และดูแลบริการ Cloudflare ให้บริการโฮสติ้ง ฐานข้อมูล และพื้นที่เก็บไฟล์ Google Gemini และ/หรือ Higgsfield ประมวลผลคำสั่งและรูปอ้างอิงเพื่อสร้างผลงาน และ Resend ส่งอีเมลเข้าสู่ระบบและแจ้งหนังสือเสร็จ</p></section>
  <section className="legal-card"><h2>เป็นส่วนตัวโดยค่าเริ่มต้น</h2><p>รูปต้นฉบับของเด็กเปิดได้เฉพาะบัญชีผู้ปกครอง หนังสือใหม่เป็นส่วนตัว ผู้ปกครองสามารถเปิดลิงก์ครอบครัวได้โดยตั้งใจ ผู้ที่ได้รับลิงก์จะอ่านได้จนกว่าจะปิดการแชร์ หนังสือจะขึ้นหน้าตัวอย่างสาธารณะได้เฉพาะเมื่อเจ้าของระบบคัดเลือกและได้รับอนุญาตแยกต่างหาก</p></section>
  <section className="legal-card"><h2>ระยะเวลาเก็บและสิทธิของคุณ</h2><p>เราเก็บข้อมูลจนกว่าผู้ปกครองจะลบโปรไฟล์เด็กหรือบัญชี เว้นแต่จำเป็นต้องเก็บข้อมูลจำกัดเพื่อความปลอดภัยหรือกฎหมาย การลบจะเอารายการฐานข้อมูลและไฟล์สื่อที่ StoryHero เป็นเจ้าของออก หากต้องการเข้าถึง แก้ไข คัดค้าน หรือติดต่อเรื่องข้อมูล กรุณาอีเมล <a href="mailto:hello@theaiceos.com">hello@theaiceos.com</a></p></section>
</div>; }

function EnglishTerms() { return <div className="legal-stack">
  <section className="legal-card"><h2>Parent or guardian use</h2><p>You must be at least 18 and authorized as the child’s parent or legal guardian. Do not upload another person’s child or any photo you do not have permission to use.</p></section>
  <section className="legal-card"><h2>Safe, lawful content</h2><p>Use StoryHero only for lawful, child-appropriate stories. Do not request sexual, exploitative, hateful, graphic, violent, or otherwise harmful content, and do not try to bypass safety controls.</p></section>
  <section className="legal-card"><h2>AI-generated results</h2><p>Generated text, images, and audio can be imperfect or vary between attempts. A parent should review every book before reading or sharing it with a child. StoryHero is a creative service, not medical, legal, or educational certification.</p></section>
  <section className="legal-card"><h2>Beta access and availability</h2><p>Free beta credits and features may be limited, changed, or paused to control costs and protect families. We work to keep the service available but do not promise uninterrupted generation or permanent storage.</p></section>
  <section className="legal-card"><h2>Sharing and deletion</h2><p>You are responsible for whom you send a family link to. You can turn sharing off at any time. You may delete a child profile or your account from Privacy & data. Contact <a href="mailto:hello@theaiceos.com">hello@theaiceos.com</a> for help.</p></section>
</div>; }

function ThaiTerms() { return <div className="legal-stack">
  <section className="legal-card"><h2>การใช้งานโดยผู้ปกครอง</h2><p>คุณต้องมีอายุอย่างน้อย 18 ปี และเป็นพ่อแม่หรือผู้ปกครองตามกฎหมายของเด็ก ห้ามอัปโหลดรูปเด็กของผู้อื่นหรือรูปที่คุณไม่มีสิทธิใช้</p></section>
  <section className="legal-card"><h2>เนื้อหาที่ปลอดภัยและถูกกฎหมาย</h2><p>ใช้ StoryHero เพื่อสร้างนิทานที่เหมาะสมกับเด็กและถูกกฎหมายเท่านั้น ห้ามขอเนื้อหาทางเพศ แสวงหาประโยชน์ สร้างความเกลียดชัง รุนแรง น่ากลัว หรือเป็นอันตราย และห้ามพยายามหลีกเลี่ยงระบบความปลอดภัย</p></section>
  <section className="legal-card"><h2>ผลงานที่สร้างด้วย AI</h2><p>ข้อความ ภาพ และเสียงอาจไม่สมบูรณ์หรือแตกต่างกันในแต่ละครั้ง ผู้ปกครองควรตรวจทุกเล่มก่อนอ่านหรือแชร์กับเด็ก StoryHero เป็นบริการสร้างสรรค์ ไม่ใช่คำรับรองทางการแพทย์ กฎหมาย หรือการศึกษา</p></section>
  <section className="legal-card"><h2>การทดลองใช้และความพร้อมของบริการ</h2><p>เครดิตและฟีเจอร์ช่วงทดลองอาจถูกจำกัด เปลี่ยนแปลง หรือหยุดชั่วคราวเพื่อควบคุมต้นทุนและปกป้องครอบครัว เราพยายามให้บริการต่อเนื่องแต่ไม่รับประกันว่าการสร้างผลงานหรือการเก็บไฟล์จะไม่มีวันหยุดชะงัก</p></section>
  <section className="legal-card"><h2>การแชร์และการลบ</h2><p>คุณรับผิดชอบผู้ที่ได้รับลิงก์ครอบครัว และปิดการแชร์ได้ทุกเมื่อ คุณสามารถลบโปรไฟล์เด็กหรือบัญชีจากหน้า “ความเป็นส่วนตัวและข้อมูล” ติดต่อ <a href="mailto:hello@theaiceos.com">hello@theaiceos.com</a> หากต้องการความช่วยเหลือ</p></section>
</div>; }
