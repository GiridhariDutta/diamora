import { db } from '../config/firebase.js';

const DEFAULT_SETTINGS = {
  privacy_policy: {
    title: 'Privacy Policy',
    content: `<h2>Privacy Policy</h2><p>Welcome to Diamora Luxury Jewelry. We respect your privacy and are committed to protecting your personal data.</p><h3>1. Information We Collect</h3><p>We collect personal information such as your name, email address, phone number, and shipping details when you place an order or schedule a vault appointment.</p><h3>2. How We Use Your Data</h3><p>Your information is used strictly to process orders, manage white-glove appointments, and provide customer support.</p><h3>3. Security & Confidentiality</h3><p>All sensitive transactions are encrypted with enterprise-grade security protocol.</p>`
  },
  terms_conditions: {
    title: 'Terms & Conditions',
    content: `<h2>Terms & Conditions</h2><p>Please read these Terms & Conditions carefully before using Diamora's services or reserving custom jewelry models.</p><h3>1. Vault Reservations & Orders</h3><p>All bespoke jewelry creations require identity verification before dispatch.</p><h3>2. Pricing & Gold Rates</h3><p>Prices are subject to daily gold rate fluctuations and certified diamond specifications.</p><h3>3. Intellectual Property</h3><p>All 3D models, designs, and catalog assets are proprietary property of Diamora.</p>`
  },
  about_us: {
    title: 'About Us',
    content: `<h2>About Diamora</h2><p>Founded in 2026, Diamora is a premier luxury jewelry house dedicated to timeless elegance, master craftsmanship, and ethically sourced certified diamonds.</p><h3>Our Legacy</h3><p>Every piece in our vault is handcrafted by master artisans with precision and passion.</p><h3>3D Vault Experience</h3><p>We blend traditional craftsmanship with cutting-edge 3D interactive technology allowing clients to inspect every angle of our fine ornaments.</p>`
  }
};

export class SettingsService {
  /**
   * Fetch setting content by document key (e.g. 'privacy_policy', 'terms_conditions')
   */
  static async getSetting(key) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!key) {
      throw new Error('Setting key is required.');
    }

    const docRef = db.collection('settings').doc(key);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return {
        key: docSnap.id,
        ...docSnap.data()
      };
    }

    // Return default preset if not saved in Firestore yet
    const fallback = DEFAULT_SETTINGS[key] || {
      title: key.replace(/_/g, ' ').toUpperCase(),
      content: '<p>Content coming soon...</p>'
    };

    return {
      key,
      ...fallback,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Create or update setting document in Firestore
   */
  static async saveSetting(key, { title, content }) {
    if (!db) {
      throw new Error('Firestore database is not initialized');
    }

    if (!key) {
      throw new Error('Setting key is required.');
    }

    const nowIso = new Date().toISOString();
    const updateData = {
      title: title ? title.trim() : (key.replace(/_/g, ' ').toUpperCase()),
      content: content || '',
      updatedAt: nowIso
    };

    await db.collection('settings').doc(key).set(updateData, { merge: true });

    return {
      key,
      ...updateData
    };
  }
}
