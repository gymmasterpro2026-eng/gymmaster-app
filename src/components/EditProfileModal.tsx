import React, { useState, useRef } from 'react';
import { Camera, Save, X, User, Phone, Upload } from 'lucide-react';
import { Profile } from '../types';
import { dataService } from '../services/dataService';

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onProfileUpdated: () => void;
  readOnlyPlan?: boolean;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/big-smile/svg?seed=SimpsonsHomer&backgroundColor=fcd34d',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=AnimeBoy1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=SimpsonBart&skinColor=f8d25c&backgroundColor=fbbf24',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=AnimeGirl1&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=SimpsonCoach&backgroundColor=f59e0b',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=AnimeHero2&backgroundColor=c084fc',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ profile, onClose, onProfileUpdated, readOnlyPlan = false }) => {
  const [fullName, setFullName] = useState(profile.full_name || '');
  const [email, setEmail] = useState(profile.email || '');
  const [password, setPassword] = useState(profile.password || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || AVATAR_PRESETS[0]);
  const [phone, setPhone] = useState(profile.phone || '');
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender || 'male');
  const [planStart, setPlanStart] = useState<string>(profile.plan_active_from || new Date().toISOString());
  const [planExpiry, setPlanExpiry] = useState<string>(profile.plan_active_until || new Date(Date.now() + 30 * 86400000).toISOString());
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [saveError, setSaveError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    // ── PARCHE SEGURIDAD: usuario duplicado ──────────────────────────────
    const emailNorm = email.trim().toLowerCase();
    const allProfiles = dataService.getProfiles();
    const duplicate = allProfiles.find(
      (p) => p.id !== profile.id && p.email.trim().toLowerCase() === emailNorm
    );
    if (duplicate) {
      setSaveError(
        `⚠️ El usuario "${email}" ya está en uso por "${duplicate.full_name}". Elegí un nombre de usuario diferente.`
      );
      return;
    }
    // ─────────────────────────────────────────────────────────────────────

    setIsSaving(true);

    dataService.updateProfile(profile.id, {
      full_name: fullName,
      email: email,
      password: password,
      avatar_url: avatarUrl,
      phone: phone,
      gender: gender,
      plan_active_from: new Date(planStart).toISOString(),
      plan_active_until: new Date(planExpiry).toISOString(),
    });

    setIsSaving(false);
    onProfileUpdated();
    onClose();
  };

  return (
    <div className="titan-modal-overlay">
      <div className="titan-modal" style={{
        width: '100%',
        maxWidth: '460px',
        maxHeight: '92vh',
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(213, 122, 48, 0.16)',
              color: '#FFBD4A',
              padding: '10px',
              border: '1px solid rgba(213, 122, 48, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} />
            </div>
            <div>
              <h3 className="titan-section-title" style={{ margin: 0, fontSize: '16px' }}>
                Editar Mi Perfil
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                Actualiza tu foto, nombre y teléfono
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="titan-btn-armor-steel"
            style={{
              padding: '6px 12px',
              fontSize: '18px',
              lineHeight: 1,
            }}
            title="Volver"
          >
            ‹
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* Avatar Section */}
          <div className="titan-inset-well" style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ position: 'relative' }}>
              <img
                src={avatarUrl}
                alt="Foto de Perfil"
                style={{
                  width: '96px',
                  height: '96px',
                  objectFit: 'cover',
                  border: '2px solid #D57A30',
                  display: 'block'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = AVATAR_PRESETS[0];
                }}
              />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="titan-btn-armor-steel"
              style={{
                padding: '8px 16px',
                fontSize: '11px',
              }}
            >
              <Upload size={14} />
              <span>Subir Foto Nueva</span>
            </button>

            {/* Presets Grid */}
            <div style={{ width: '100%', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <label style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                O elige un avatar prediseñado:
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`Preset ${idx}`}
                    onClick={() => setAvatarUrl(preset)}
                    style={{
                      width: '36px',
                      height: '36px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: avatarUrl === preset ? '2px solid #D57A30' : '1px solid rgba(148,163,184,0.3)',
                      opacity: avatarUrl === preset ? 1 : 0.65,
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Full Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Nombre Completo:
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="#D57A30" style={{ position: 'absolute', left: '12px', top: '12px', pointerEvents: 'none' }} />
              <input
                type="text"
                className="titan-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Ej. Diego Perez"
                style={{
                  width: '100%',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '10px 12px 10px 38px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {/* Email Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Usuario (Correo):
              </label>
              <input
                type="text"
                className="titan-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="coach@gym.com"
                style={{
                  width: '100%',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '10px 12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
              <label style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Contraseña:
              </label>
              <input
                type="text"
                className="titan-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                style={{
                  width: '100%',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '10px 12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Phone Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Número de Celular / WhatsApp:
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="#D57A30" style={{ position: 'absolute', left: '12px', top: '12px', pointerEvents: 'none' }} />
              <input
                type="text"
                className="titan-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 1234-5678"
                style={{
                  width: '100%',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '10px 12px 10px 38px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Gender Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Género:
            </label>
            <select
              className="titan-select"
              value={gender}
              onChange={(e) => setGender(e.target.value as 'male' | 'female')}
              style={{
                width: '100%',
                fontSize: '13px',
                fontWeight: 700,
                padding: '10px 12px',
                boxSizing: 'border-box'
              }}
            >
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          </div>

          {/* Vigencia Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, color: '#D57A30', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Vigencia del Plan (Desde - Hasta):
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="datetime-local"
                className="titan-input"
                value={planStart.slice(0, 16)}
                onChange={(e) => setPlanStart(new Date(e.target.value).toISOString())}
                required
                disabled={readOnlyPlan}
                style={{
                  flex: 1,
                  opacity: readOnlyPlan ? 0.55 : 1,
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '10px 12px',
                  boxSizing: 'border-box',
                  cursor: readOnlyPlan ? 'not-allowed' : 'text',
                  colorScheme: 'dark'
                }}
              />
              <input
                type="datetime-local"
                className="titan-input"
                value={planExpiry.slice(0, 16)}
                onChange={(e) => setPlanExpiry(new Date(e.target.value).toISOString())}
                required
                disabled={readOnlyPlan}
                style={{
                  flex: 1,
                  opacity: readOnlyPlan ? 0.55 : 1,
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '10px 12px',
                  boxSizing: 'border-box',
                  cursor: readOnlyPlan ? 'not-allowed' : 'text',
                  colorScheme: 'dark'
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {saveError && (
              <div style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.4)',
                padding: '10px 14px',
                color: '#f87171',
                fontSize: '12px',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                {saveError}
              </div>
            )}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
          }}>
            <button
              type="button"
              onClick={onClose}
              className="titan-btn-armor-steel"
              style={{
                fontSize: '11px',
                padding: '9px 14px',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="titan-btn-armor-copper"
              style={{
                padding: '10px 20px',
                fontSize: '12px',
              }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
          </div>
        </form>
      </div>
    </div>
  );
};
