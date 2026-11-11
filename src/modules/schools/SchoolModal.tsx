import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { School, Zone, SchoolCategoryType, AccountStatusType } from '@/types';
import { isValidGeofenceRadius } from '@/lib/geofence';

interface SchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  school?: School | null;
  zones: Zone[];
  onSave: (schoolData: Partial<School>) => void;
}

export const SchoolModal: React.FC<SchoolModalProps> = ({
  isOpen,
  onClose,
  school,
  zones,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<SchoolCategoryType>('SK');
  const [zoneId, setZoneId] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('89208');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [latitude, setLatitude] = useState('6.134000');
  const [longitude, setLongitude] = useState('116.230000');
  const [geofenceRadius, setGeofenceRadius] = useState('100');
  const [status, setStatus] = useState<AccountStatusType>('ACTIVE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (school) {
      setCode(school.code);
      setName(school.name);
      setCategory(school.category);
      setZoneId(school.zone_id || '');
      setAddress(school.address || '');
      setPostalCode(school.postal_code || '89208');
      setPhone(school.phone || '');
      setEmail(school.email || '');
      setLatitude(school.latitude.toString());
      setLongitude(school.longitude.toString());
      setGeofenceRadius(school.geofence_radius_meters.toString());
      setStatus(school.status);
    } else {
      setCode('');
      setName('');
      setCategory('SK');
      setZoneId('');
      setAddress('');
      setPostalCode('89208');
      setPhone('');
      setEmail('');
      setLatitude('6.134000');
      setLongitude('116.230000');
      setGeofenceRadius('100');
      setStatus('ACTIVE');
    }
    setErrorMsg(null);
  }, [school, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    const radiusNum = parseInt(geofenceRadius, 10);

    if (isNaN(latNum) || isNaN(lngNum)) {
      setErrorMsg('Koordinat latitud atau longitud tidak sah.');
      return;
    }

    if (!isValidGeofenceRadius(radiusNum)) {
      setErrorMsg('Radius geofence mestilah antara 50 meter hingga 500 meter.');
      return;
    }

    const matchedZone = zones.find((z) => z.id === zoneId);

    onSave({
      code: code.trim().toUpperCase(),
      name: name.trim().toUpperCase(),
      category,
      zone_id: zoneId || undefined,
      zone_name: matchedZone?.name,
      zone_code: matchedZone?.code,
      address: address.trim(),
      postal_code: postalCode.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      latitude: latNum,
      longitude: lngNum,
      geofence_radius_meters: radiusNum,
      status,
      location_status: 'VERIFIED',
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={school ? `Kemaskini ${school.name}` : 'Daftar Sekolah Baharu'}
      subtitle="Tetapkan profil rasmi sekolah, zon pentadbiran dan radius kehadiran geofence"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kod Sekolah (KPM)
            </label>
            <input
              type="text"
              required
              disabled={!!school}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XBA4001"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase disabled:bg-slate-100"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Rasmi Sekolah
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="SK PEKAN TUARAN"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Sekolah</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SchoolCategoryType)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="SK">Sekolah Kebangsaan (SK)</option>
              <option value="SMK">Sekolah Menengah Kebangsaan (SMK)</option>
              <option value="SJKC">Sekolah Jenis Kebangsaan Cina (SJKC)</option>
              <option value="SJKT">Sekolah Jenis Kebangsaan Tamil (SJKT)</option>
              <option value="SABK">Sekolah Agama Bantuan Kerajaan (SABK)</option>
              <option value="K9">Model Komprehensif 9 (K9)</option>
              <option value="OTHER">Lain-Lain Institusi Pendidikan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Zon Pentadbiran (Wajib Ditugaskan Manual)
            </label>
            <select
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="">-- Pilih Salah Satu Zon --</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.code} — {z.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Surat-Menyurat</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Peti Surat 102, 89208 Tuaran, Sabah"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Poskod</label>
            <input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="89208"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">No. Telefon Pejabat</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="088-788100"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Emel Rasmi Sekolah</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="xba4001@moe.edu.my"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Geofence & Location Coordinates */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
            <span>Koordinat GPS & Geofence Kehadiran</span>
            <span className="text-[11px] text-blue-700 font-normal">Radius Piawai: 50m - 500m</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Latitud</label>
              <input
                type="number"
                step="0.000001"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="6.130540"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Longitud</label>
              <input
                type="number"
                step="0.000001"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="116.233210"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Radius (Meter)</label>
              <input
                type="number"
                min="50"
                max="500"
                required
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(e.target.value)}
                placeholder="100"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {school ? 'Simpan Maklumat' : 'Daftar Sekolah'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

