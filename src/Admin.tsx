import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  acceptInvite,
  AuthError,
  getUser,
  handleAuthCallback,
  login,
  logout,
  MissingIdentityError,
  requestPasswordRecovery,
  updateUser,
  type User,
} from '@netlify/identity';
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  LogOut,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { GalaxyBackground, LinkLogo } from './App';
import { ICON_MAP } from './constants';
import { ApiLink, COLOR_OPTIONS, ICON_NAMES, LOGO_TYPES, MAX_LOGO_BYTES } from './linkOptions';

const inputClass =
  'w-full rounded-xl bg-zinc-900/70 border border-white/10 px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors';
const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const cardClass = 'rounded-2xl glass-dark p-6';

const authMessage = (error: unknown) => {
  if (error instanceof MissingIdentityError) return 'Netlify Identity belum aktif di situs ini.';
  if (error instanceof AuthError) {
    if (error.status === 401) return 'Email atau password salah.';
    return error.message;
  }
  return 'Terjadi kesalahan. Coba lagi.';
};

const apiError = async (res: Response) => {
  try {
    const body = await res.json();
    return body.error || `Gagal (${res.status})`;
  } catch {
    return `Gagal (${res.status})`;
  }
};

const validateLogo = (file: File | null) => {
  if (!file) return null;
  if (!LOGO_TYPES.includes(file.type)) return 'Format logo harus PNG, JPG, WEBP, atau GIF.';
  if (file.size > MAX_LOGO_BYTES) return 'Ukuran logo maksimal 2 MB.';
  return null;
};

type Screen =
  | { kind: 'loading' }
  | { kind: 'login' }
  | { kind: 'setPassword'; inviteToken?: string }
  | { kind: 'ready'; user: User };

export default function Admin() {
  const [screen, setScreen] = useState<Screen>({ kind: 'loading' });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await handleAuthCallback();
        if (result?.type === 'invite') return setScreen({ kind: 'setPassword', inviteToken: result.token });
        if (result?.type === 'recovery') return setScreen({ kind: 'setPassword' });
      } catch (error) {
        setNotice(authMessage(error));
      }
      const user = await getUser();
      setScreen(user ? { kind: 'ready', user } : { kind: 'login' });
    })();
  }, []);

  const handleLogout = async () => {
    await logout();
    setScreen({ kind: 'login' });
  };

  return (
    <div className="min-h-screen w-full relative">
      <GalaxyBackground />
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <header className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={16} /> Kembali ke halaman utama
            </a>
            <h1 className="mt-2 font-display text-3xl font-bold text-white">Admin Link</h1>
          </div>
          {screen.kind === 'ready' && (
            <button onClick={handleLogout} className={`${buttonClass} bg-white/10 text-white hover:bg-white/20`}>
              <LogOut size={18} /> Keluar
            </button>
          )}
        </header>

        {notice && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {notice}
          </div>
        )}

        {screen.kind === 'loading' && (
          <div className="flex justify-center py-20 text-zinc-400">
            <Loader2 className="animate-spin" />
          </div>
        )}
        {screen.kind === 'login' && <LoginForm onLogin={(user) => setScreen({ kind: 'ready', user })} />}
        {screen.kind === 'setPassword' && (
          <SetPasswordForm
            inviteToken={screen.inviteToken}
            onDone={(user) => setScreen({ kind: 'ready', user })}
          />
        )}
        {screen.kind === 'ready' &&
          (screen.user.roles?.includes('admin') ? (
            <LinkManager />
          ) : (
            <div className={cardClass}>
              <p className="text-white font-semibold">Akses ditolak</p>
              <p className="mt-2 text-sm text-zinc-400">
                Akun <span className="text-zinc-200">{screen.user.email}</span> belum memiliki role{' '}
                <code className="text-indigo-300">admin</code>. Tambahkan role tersebut di dashboard Netlify
                (Identity → pilih user → Roles), lalu keluar dan masuk kembali.
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      onLogin(await login(email, password));
    } catch (error) {
      setMessage(authMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!email) return setMessage('Isi email terlebih dahulu.');
    try {
      await requestPasswordRecovery(email);
      setMessage('Link reset password sudah dikirim ke email Anda.');
    } catch (error) {
      setMessage(authMessage(error));
    }
  };

  return (
    <form onSubmit={submit} className={`${cardClass} space-y-4`}>
      <h2 className="text-lg font-semibold text-white">Masuk</h2>
      <input className={inputClass} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      <input className={inputClass} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
      {message && <p className="text-sm text-amber-300">{message}</p>}
      <button disabled={busy} className={`${buttonClass} w-full bg-indigo-600 text-white hover:bg-indigo-500`}>
        {busy && <Loader2 size={18} className="animate-spin" />} Masuk
      </button>
      <button type="button" onClick={forgot} className="w-full text-sm text-zinc-400 hover:text-white">
        Lupa password?
      </button>
    </form>
  );
}

function SetPasswordForm({ inviteToken, onDone }: { inviteToken?: string; onDone: (user: User) => void }) {
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const user = inviteToken ? await acceptInvite(inviteToken, password) : await updateUser({ password });
      onDone(user);
    } catch (error) {
      setMessage(authMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={`${cardClass} space-y-4`}>
      <h2 className="text-lg font-semibold text-white">{inviteToken ? 'Terima undangan' : 'Atur password baru'}</h2>
      <input className={inputClass} type="password" placeholder="Password baru" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
      {message && <p className="text-sm text-amber-300">{message}</p>}
      <button disabled={busy} className={`${buttonClass} w-full bg-indigo-600 text-white hover:bg-indigo-500`}>
        {busy && <Loader2 size={18} className="animate-spin" />} Simpan password
      </button>
    </form>
  );
}

function IconPicker({ value, color, onChange }: { value: string; color: string; onChange: (icon: string) => void }) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
      {ICON_NAMES.map((name) => {
        const Icon = ICON_MAP[name];
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={`flex items-center justify-center h-11 rounded-xl transition-all ${
              selected ? `${color} text-white ring-2 ring-white/70` : 'bg-white/5 text-zinc-300 hover:bg-white/10'
            }`}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </div>
  );
}

function LogoInput({ file, onChange }: { file: File | null; onChange: (file: File | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div className="flex items-center gap-3">
      <input ref={ref} type="file" accept={LOGO_TYPES.join(',')} className="hidden" onChange={(e) => { onChange(e.target.files?.[0] ?? null); e.target.value = ''; }} />
      {preview ? (
        <>
          <img src={preview} alt="" className="w-12 h-12 rounded-xl object-cover" />
          <span className="flex-1 truncate text-sm text-zinc-300">{file!.name}</span>
          <button type="button" onClick={() => onChange(null)} className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10" title="Batal">
            <X size={18} />
          </button>
        </>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} className={`${buttonClass} bg-white/5 text-zinc-200 hover:bg-white/10 py-2`}>
          <Upload size={18} /> Upload logo
        </button>
      )}
    </div>
  );
}

function LinkManager() {
  const [links, setLinks] = useState<ApiLink[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/links');
    if (res.ok) setLinks(await res.json());
    else setError(await apiError(res));
  };

  useEffect(() => { load(); }, []);

  const remove = async (link: ApiLink) => {
    if (!confirm(`Hapus link "${link.title}"?`)) return;
    const res = await fetch(`/api/links/${link.id}`, { method: 'DELETE' });
    if (res.ok) setLinks((prev) => prev?.filter((l) => l.id !== link.id) ?? null);
    else setError(await apiError(res));
  };

  const replace = (updated: ApiLink) =>
    setLinks((prev) => prev?.map((l) => (l.id === updated.id ? updated : l)) ?? null);

  return (
    <div className="space-y-8">
      <AddLinkForm onAdded={(link) => setLinks((prev) => [...(prev ?? []), link])} />

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">Link saat ini</h2>
        {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
        {!links ? (
          <div className="flex justify-center py-10 text-zinc-400"><Loader2 className="animate-spin" /></div>
        ) : links.length === 0 ? (
          <p className="text-sm text-zinc-400">Belum ada link.</p>
        ) : (
          <ul className="space-y-3">
            {links.map((link) => (
              <LinkRow key={link.id} link={link} onDelete={() => remove(link)} onUpdated={replace} onError={setError} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AddLinkForm({ onAdded }: { onAdded: (link: ApiLink) => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState<string>('ExternalLink');
  const [color, setColor] = useState<string>(COLOR_OPTIONS[0]);
  const [logo, setLogo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const logoError = validateLogo(logo);
    if (logoError) return setMessage(logoError);

    setBusy(true);
    setMessage(null);
    const form = new FormData();
    form.set('title', title);
    form.set('url', url);
    form.set('icon', icon);
    form.set('color', color);
    if (logo) form.set('logo', logo);

    const res = await fetch('/api/links', { method: 'POST', body: form });
    setBusy(false);
    if (!res.ok) return setMessage(await apiError(res));

    onAdded(await res.json());
    setTitle('');
    setUrl('');
    setLogo(null);
  };

  return (
    <form onSubmit={submit} className={`${cardClass} space-y-5`}>
      <h2 className="text-lg font-semibold text-white">Tambah link baru</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <input className={inputClass} placeholder="Judul (mis. Instagram)" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className={inputClass} type="url" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-300">Logo</p>
        <p className="text-xs text-zinc-500">Upload gambar sendiri, atau pilih ikon bawaan di bawah. Gambar yang diupload diutamakan.</p>
        <LogoInput file={logo} onChange={setLogo} />
      </div>

      <div className={`space-y-2 ${logo ? 'opacity-40' : ''}`}>
        <p className="text-sm font-medium text-zinc-300">Ikon</p>
        <IconPicker value={icon} color={color} onChange={setIcon} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-300">Warna latar ikon</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              title={c}
              className={`w-8 h-8 rounded-full ${c} border border-white/20 ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''}`}
            />
          ))}
        </div>
      </div>

      {message && <p className="text-sm text-red-300">{message}</p>}

      <button disabled={busy} className={`${buttonClass} w-full bg-indigo-600 text-white hover:bg-indigo-500`}>
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Tambah link
      </button>
    </form>
  );
}

function LinkRow({
  link,
  onDelete,
  onUpdated,
  onError,
}: {
  key?: number;
  link: ApiLink;
  onDelete: () => void;
  onUpdated: (link: ApiLink) => void;
  onError: (message: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const patch = async (form: FormData) => {
    setBusy(true);
    const res = await fetch(`/api/links/${link.id}`, { method: 'PATCH', body: form });
    setBusy(false);
    if (!res.ok) return onError(await apiError(res));
    onUpdated(await res.json());
  };

  const uploadLogo = (file: File) => {
    const logoError = validateLogo(file);
    if (logoError) return onError(logoError);
    const form = new FormData();
    form.set('logo', file);
    patch(form);
  };

  const removeLogo = () => {
    if (!confirm(`Hapus logo dari "${link.title}"? Ikon bawaan akan ditampilkan.`)) return;
    const form = new FormData();
    form.set('removeLogo', '1');
    patch(form);
  };

  const setIcon = (icon: string) => {
    const form = new FormData();
    form.set('icon', icon);
    patch(form);
  };

  return (
    <li className="rounded-2xl bg-zinc-800/50 border border-white/5 p-4">
      <div className="flex items-center gap-4">
        <LinkLogo link={link} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{link.title}</p>
          <p className="text-xs text-zinc-400 truncate">{link.url}</p>
        </div>
        {busy && <Loader2 size={18} className="animate-spin text-zinc-400" />}
        <button
          onClick={() => setEditing((v) => !v)}
          className={`p-2 rounded-lg transition-colors ${editing ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
          title="Ubah logo"
        >
          <ImagePlus size={18} />
        </button>
        <button onClick={onDelete} className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Hapus link">
          <Trash2 size={18} />
        </button>
      </div>

      {editing && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept={LOGO_TYPES.join(',')} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); e.target.value = ''; }} />
            <button disabled={busy} onClick={() => fileRef.current?.click()} className={`${buttonClass} py-2 bg-white/5 text-zinc-200 hover:bg-white/10`}>
              <Upload size={16} /> {link.logoUrl ? 'Ganti logo' : 'Upload logo'}
            </button>
            {link.logoUrl && (
              <button disabled={busy} onClick={removeLogo} className={`${buttonClass} py-2 bg-red-500/10 text-red-300 hover:bg-red-500/20`}>
                <Trash2 size={16} /> Hapus logo
              </button>
            )}
          </div>
          <div className={`space-y-2 ${link.logoUrl ? 'opacity-40' : ''}`}>
            <p className="text-xs text-zinc-400">
              Ikon bawaan{link.logoUrl ? ' (dipakai jika logo dihapus)' : ''}
            </p>
            <IconPicker value={link.icon} color={link.color} onChange={setIcon} />
          </div>
        </div>
      )}
    </li>
  );
}
