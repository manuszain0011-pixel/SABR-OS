-- ==================== PRAYER ENHANCEMENTS ====================

-- Add new columns to prayer_records for enhanced tracking
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS duha TEXT DEFAULT 'pending';
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS witr TEXT DEFAULT 'pending';

-- Add columns for Jamaah tracking and prayer quality
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS fajr_jamaah BOOLEAN DEFAULT false;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS dhuhr_jamaah BOOLEAN DEFAULT false;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS asr_jamaah BOOLEAN DEFAULT false;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS maghrib_jamaah BOOLEAN DEFAULT false;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS isha_jamaah BOOLEAN DEFAULT false;

-- Prayer quality notes
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS fajr_notes TEXT;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS dhuhr_notes TEXT;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS asr_notes TEXT;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS maghrib_notes TEXT;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS isha_notes TEXT;

-- Sunnah prayers tracking
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS fajr_sunnah_before BOOLEAN DEFAULT false;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS dhuhr_sunnah_before BOOLEAN DEFAULT false;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS dhuhr_sunnah_after BOOLEAN DEFAULT false;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS maghrib_sunnah_after BOOLEAN DEFAULT false;
ALTER TABLE prayer_records ADD COLUMN IF NOT EXISTS isha_sunnah_after BOOLEAN DEFAULT false;

-- Create Qada (missed prayers) tracker table
CREATE TABLE IF NOT EXISTS qada_prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prayer_name TEXT NOT NULL,
  original_date DATE NOT NULL,
  completed_date DATE,
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE qada_prayers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own qada prayers" ON qada_prayers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ==================== QURAN ENHANCEMENTS ====================

-- Add memorization tracking columns
ALTER TABLE quran_progress ADD COLUMN IF NOT EXISTS is_memorization BOOLEAN DEFAULT false;
ALTER TABLE quran_progress ADD COLUMN IF NOT EXISTS is_revision BOOLEAN DEFAULT false;
ALTER TABLE quran_progress ADD COLUMN IF NOT EXISTS memorization_quality INTEGER; -- 1-5 rating
ALTER TABLE quran_progress ADD COLUMN IF NOT EXISTS next_revision_date DATE;

-- Create Quran memorization table for detailed tracking
CREATE TABLE IF NOT EXISTS quran_memorization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_from INTEGER NOT NULL,
  ayah_to INTEGER NOT NULL,
  memorized_date DATE NOT NULL,
  last_revised_date DATE,
  revision_count INTEGER DEFAULT 0,
  next_revision_date DATE,
  quality_rating INTEGER, -- 1-5
  tajweed_notes TEXT,
  tafsir_notes TEXT,
  is_solid BOOLEAN DEFAULT false, -- Firmly memorized
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quran_memorization ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own memorization" ON quran_memorization FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_quran_memorization_updated_at BEFORE UPDATE ON quran_memorization FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create Khatm (completion) tracker
CREATE TABLE IF NOT EXISTS quran_khatm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  completion_date DATE,
  is_completed BOOLEAN DEFAULT false,
  total_days INTEGER,
  notes TEXT,
  dua_made TEXT, -- Dua made upon completion
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE quran_khatm ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own khatm" ON quran_khatm FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ==================== GOALS & TASKS ENHANCEMENTS ====================

-- Add Islamic enhancement columns to goals
ALTER TABLE goals ADD COLUMN IF NOT EXISTS niyyah TEXT; -- Intention
ALTER TABLE goals ADD COLUMN IF NOT EXISTS barakah_score INTEGER DEFAULT 3; -- 1-5 scale
ALTER TABLE goals ADD COLUMN IF NOT EXISTS attached_dua TEXT;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS is_sadaqah_jariyah BOOLEAN DEFAULT false;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS halal_status TEXT DEFAULT 'halal'; -- halal, questionable, haram

-- Add Islamic enhancement columns to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS niyyah TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS barakah_score INTEGER DEFAULT 3;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attached_dua TEXT;

-- Add Islamic enhancement columns to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS niyyah TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS barakah_score INTEGER DEFAULT 3;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_sadaqah_jariyah BOOLEAN DEFAULT false;

-- ==================== FINANCE ENHANCEMENTS ====================

-- Add Zakat tracking columns
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS is_zakatable BOOLEAN DEFAULT false;
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS is_sadaqah BOOLEAN DEFAULT false;
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS sadaqah_type TEXT; -- regular, jariyah, wajib

-- Add halal investment tracking
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS halal_status TEXT DEFAULT 'halal'; -- halal, questionable, haram, unknown
ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS rizq_gratitude TEXT; -- Gratitude note

-- Create Zakat tracker table
CREATE TABLE IF NOT EXISTS zakat_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  year INTEGER NOT NULL,
  nisab_amount DECIMAL(12,2) NOT NULL,
  total_zakatable_wealth DECIMAL(12,2) NOT NULL,
  zakat_due DECIMAL(12,2) NOT NULL,
  zakat_paid DECIMAL(12,2) DEFAULT 0,
  is_paid BOOLEAN DEFAULT false,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE zakat_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own zakat records" ON zakat_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_zakat_records_updated_at BEFORE UPDATE ON zakat_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ==================== HABITS ENHANCEMENTS ====================

-- Add Islamic habit tracking
ALTER TABLE habits ADD COLUMN IF NOT EXISTS is_sunnah BOOLEAN DEFAULT false;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS habit_category TEXT DEFAULT 'personal'; -- sunnah, fard, mustahabb, personal
ALTER TABLE habits ADD COLUMN IF NOT EXISTS ramadan_only BOOLEAN DEFAULT false;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS is_group_habit BOOLEAN DEFAULT false;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS group_members TEXT[]; -- Array of user IDs or names

-- Create Islamic habit templates table
CREATE TABLE IF NOT EXISTS habit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- sunnah, fard, mustahabb
  frequency TEXT DEFAULT 'daily',
  target_count INTEGER DEFAULT 1,
  icon TEXT,
  color TEXT,
  is_sunnah BOOLEAN DEFAULT false,
  islamic_reference TEXT, -- Hadith or Quran reference
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default Islamic habit templates
INSERT INTO habit_templates (name, description, category, frequency, is_sunnah, islamic_reference, icon, color) VALUES
('Tahajjud Prayer', 'Night prayer before Fajr', 'sunnah', 'daily', true, 'The Prophet (ﷺ) never missed Tahajjud', '🌙', '#4F46E5'),
('Morning Azkar', 'Morning remembrance after Fajr', 'sunnah', 'daily', true, 'Fortress of the Muslim', '☀️', '#F59E0B'),
('Evening Azkar', 'Evening remembrance after Asr', 'sunnah', 'daily', true, 'Fortress of the Muslim', '🌆', '#8B5CF6'),
('Quran Recitation', 'Daily Quran reading', 'mustahabb', 'daily', true, 'Recite Quran regularly', '📖', '#10B981'),
('Duha Prayer', '2-8 rakah mid-morning prayer', 'sunnah', 'daily', true, 'Prayer of the Awwabin', '🌤️', '#F97316'),
('Miswak', 'Use Miswak for oral hygiene', 'sunnah', 'daily', true, 'Purification for the mouth', '🪥', '#06B6D4'),
('Sadaqah', 'Daily charity (even small)', 'mustahabb', 'daily', true, 'Charity extinguishes sins', '💝', '#EC4899'),
('Istighfar 100x', 'Seek forgiveness 100 times', 'sunnah', 'daily', true, 'Say Astaghfirullah 100 times', '🤲', '#6366F1'),
('Salawat on Prophet', 'Send blessings on Prophet ﷺ', 'mustahabb', 'daily', true, 'Increase in blessings', '☪️', '#14B8A6'),
('Witr Prayer', 'Odd-numbered prayer before sleep', 'sunnah', 'daily', true, 'Last prayer of the night', '🌃', '#7C3AED');

-- ==================== WELLNESS ENHANCEMENTS ====================

-- Create Sunnah health practices tracker
CREATE TABLE IF NOT EXISTS sunnah_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  practice_type TEXT NOT NULL, -- miswak, cupping, honey, black_seed, dates, etc.
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sunnah_practices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own sunnah practices" ON sunnah_practices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enhance fasting records with voluntary fasting types
ALTER TABLE fasting_records ADD COLUMN IF NOT EXISTS is_voluntary BOOLEAN DEFAULT true;
ALTER TABLE fasting_records ADD COLUMN IF NOT EXISTS fasting_category TEXT; -- monday, thursday, white_days, ashura, arafah, shawwal, dawud

-- ==================== DASHBOARD ENHANCEMENTS ====================

-- Create daily spiritual checklist table
CREATE TABLE IF NOT EXISTS daily_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  morning_azkar BOOLEAN DEFAULT false,
  evening_azkar BOOLEAN DEFAULT false,
  quran_read BOOLEAN DEFAULT false,
  sadaqah_given BOOLEAN DEFAULT false,
  istighfar_100 BOOLEAN DEFAULT false,
  salawat_prophet BOOLEAN DEFAULT false,
  dua_made BOOLEAN DEFAULT false,
  good_deed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own checklist" ON daily_checklist FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_daily_checklist_updated_at BEFORE UPDATE ON daily_checklist FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create inspirational content table
CREATE TABLE IF NOT EXISTS daily_inspiration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL, -- ayah, hadith, quote
  arabic_text TEXT,
  translation TEXT NOT NULL,
  reference TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert some default inspirational content
INSERT INTO daily_inspiration (content_type, arabic_text, translation, reference, category) VALUES
('ayah', 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', 'For indeed, with hardship comes ease.', 'Quran 94:5', 'patience'),
('ayah', 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُۥ', 'And whoever relies upon Allah - then He is sufficient for him.', 'Quran 65:3', 'trust'),
('hadith', NULL, 'The best of people are those who are most beneficial to people.', 'Sahih al-Bukhari', 'character'),
('hadith', NULL, 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.', 'Sahih al-Bukhari', 'speech'),
('ayah', 'وَٱذْكُر رَّبَّكَ إِذَا نَسِيتَ', 'And remember your Lord when you forget.', 'Quran 18:24', 'remembrance');

COMMENT ON TABLE qada_prayers IS 'Tracks missed prayers that need to be made up';
COMMENT ON TABLE quran_memorization IS 'Detailed tracking of Quran memorization with revision scheduling';
COMMENT ON TABLE quran_khatm IS 'Tracks complete readings of the Quran';
COMMENT ON TABLE zakat_records IS 'Annual Zakat calculation and payment tracking';
COMMENT ON TABLE habit_templates IS 'Pre-built Islamic habit templates for users';
COMMENT ON TABLE sunnah_practices IS 'Tracks Sunnah health practices';
COMMENT ON TABLE daily_checklist IS 'Daily spiritual practices checklist';
COMMENT ON TABLE daily_inspiration IS 'Collection of ayahs, hadiths, and quotes for daily inspiration';
