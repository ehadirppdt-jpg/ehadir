import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Save,
  Building2,
  School as SchoolIcon,
  Search,
  CheckCircle2,
  Layers,
  Compass,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dbService } from '@/lib/db';
import { School, Zone, PpdOfficeLocation } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { InteractiveGeofenceMap } from '@/components/maps/InteractiveGeofenceMap';

export const SchoolMapPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [schools, setSchools] = useState<School[]>(() => dbService.getSchools());
  const zones = useMemo(() => dbService.getZones(), []);

  // Target selection: 'SCHOOL' or 'PPD'
  const [selectedTargetType, setSelectedTargetType] = useState<'SCHOOL' | 'PPD'>('SCHOOL');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(schools[0]?.id || '');
  const [searchFilter, setSearchFilter] = useState('');

  // PPD Office Location state from database/persistent storage
  const [ppdOffice, setPpdOffice] = useState<PpdOfficeLocation>(() =>
    dbService.getPpdOfficeLocation()
  );

  const selectedSchool = useMemo(() => {
    return schools.find((s) => s.id === selectedSchoolId) || schools[0];
  }, [schools, selectedSchoolId]);

  // Local map editing states
  const [editLat, setEditLat] = useState<number>(selectedSchool ? selectedSchool.latitude : 6.134);
  const [editLng, setEditLng] = useState<number>(selectedSchool ? selectedSchool.longitude : 116.23);
  const [editRadius, setEditRadius] = useState<number>(
    selectedSchool ? selectedSchool.geofence_radius_meters : 100
  );

  // Sync when selected target or school changes
  useEffect(() => {
    if (selectedTargetType === 'PPD') {
      setEditLat(ppdOffice.latitude);
      setEditLng(ppdOffice.longitude);
      setEditRadius(ppdOffice.radius_meters);
    } else if (selectedSchool) {
      setEditLat(selectedSchool.latitude);
      setEditLng(selectedSchool.longitude);
      setEditRadius(selectedSchool.geofence_radius_meters);
    }
  }, [selectedTargetType, selectedSchool, ppdOffice]);

  const handleSaveGeofence = () => {
    if (!user) return;

    if (selectedTargetType === 'PPD') {
      try {
        const updated = dbService.updatePpdOfficeLocation(
          {
            latitude: editLat,
            longitude: editLng,
            radius_meters: editRadius,
          },
          user
        );
        setPpdOffice(updated);
        showToast(
          `Tetapan Geofence Ibu Pejabat PPD Tuaran berjaya dikemaskini (${editRadius}m).`,
          'success'
        );
      } catch (e: any) {
        showToast(e.message, 'error');
      }
    } else {
      if (!selectedSchool) return;
      try {
        dbService.updateSchool(
          selectedSchool.id,
          {
            latitude: editLat,
            longitude: editLng,
            geofence_radius_meters: editRadius,
          },
          user
        );
        showToast(
          `Tetapan Geofence bagi ${selectedSchool.name} berjaya dikemaskini (${editRadius}m).`,
          'success'
        );
        setSchools(dbService.getSchools());
      } catch (e: any) {
        showToast(e.message, 'error');
      }
    }
  };

  const filteredList = useMemo(() => {
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        s.code.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [schools, searchFilter]);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-600" />
            Peta Lokasi & Kawalan Geofence (Sekolah & PPD Tuaran)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi peta interaktif OpenStreetMap, penentukuran koordinat GPS, dan konfigurasi perimeter kehadiran sah (50m - 500m).
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant={selectedTargetType === 'PPD' ? 'teal' : 'primary'}
            size="sm"
            onClick={handleSaveGeofence}
            icon={<Save className="w-4 h-4" />}
          >
            {selectedTargetType === 'PPD'
              ? 'Simpan Geofence PPD Tuaran'
              : 'Simpan Geofence Sekolah'}
          </Button>
        )}
      </div>

      {/* Approved Locations Quick Selector Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Assigned Schools */}
        <div
          onClick={() => setSelectedTargetType('SCHOOL')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedTargetType === 'SCHOOL'
              ? 'bg-blue-50/90 border-blue-400 shadow-sm ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedTargetType === 'SCHOOL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <SchoolIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  1. Lokasi Sekolah Masing-Masing
                </h4>
                <Badge variant={selectedTargetType === 'SCHOOL' ? 'primary' : 'neutral'} size="sm">
                  {schools.length} Sekolah
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Konfigurasi radius geofence dan titik tengah GPS bagi setiap sekolah yang ditugaskan kepada PGB.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: PPD Tuaran HQ */}
        <div
          onClick={() => setSelectedTargetType('PPD')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            selectedTargetType === 'PPD'
              ? 'bg-teal-50/90 border-teal-400 shadow-sm ring-2 ring-teal-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                selectedTargetType === 'PPD'
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  2. Pejabat Pendidikan Daerah Tuaran
                </h4>
                <Badge variant={selectedTargetType === 'PPD' ? 'teal' : 'neutral'} size="sm">
                  Pusat Rasmi ({ppdOffice.radius_meters}m)
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                Klik di sini untuk mengkonfigurasi lokasi GPS dan perimeter geofence Ibu Pejabat PPD Tuaran seperti sekolah.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map + Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: School Selection List or PPD Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col h-[520px]">
          {/* Featured Top Item: PPD Tuaran HQ */}
          <div className="mb-3 pb-3 border-b border-slate-100">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Ibu Pejabat (Lokasi Berpusat)
            </label>
            <div
              onClick={() => setSelectedTargetType('PPD')}
              className={`p-3 rounded-xl cursor-pointer transition-all ${
                selectedTargetType === 'PPD'
                  ? 'bg-teal-50 border-2 border-teal-500 shadow-xs'
                  : 'bg-slate-50 border border-slate-200 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2
                    className={`w-4 h-4 ${
                      selectedTargetType === 'PPD' ? 'text-teal-600' : 'text-slate-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      selectedTargetType === 'PPD' ? 'text-teal-900' : 'text-slate-800'
                    }`}
                  >
                    PPD Tuaran (HQ)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded">
                  {ppdOffice.radius_meters}m
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Lokasi kehadiran sah kedua untuk semua PGB
              </p>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Pilih Sekolah ({filteredList.length})
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari sekolah..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
            {filteredList.map((school) => {
              const isSelected = selectedTargetType === 'SCHOOL' && school.id === selectedSchoolId;
              const zone = zones.find((z) => z.id === school.zone_id);

              return (
                <div
                  key={school.id}
                  onClick={() => {
                    setSelectedTargetType('SCHOOL');
                    setSelectedSchoolId(school.id);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-200 shadow-xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs font-bold ${
                        isSelected ? 'text-blue-900' : 'text-slate-900'
                      }`}
                    >
                      {school.name}
                    </p>
                    <span className="text-[10px] font-mono font-semibold text-slate-500">
                      {school.code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>{zone?.name || 'Tanpa Zon'}</span>
                    <span className="font-semibold text-blue-700">
                      {school.geofence_radius_meters}m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Interactive Geofence Map View */}
        <div className="lg:col-span-2 space-y-4">
          <InteractiveGeofenceMap
            key={selectedTargetType === 'PPD' ? 'ppd-target' : selectedSchool?.id}
            locationType={selectedTargetType}
            latitude={editLat}
            longitude={editLng}
            radiusMeters={editRadius}
            schoolName={
              selectedTargetType === 'PPD'
                ? 'Pejabat Pendidikan Daerah Tuaran (PPD Tuaran)'
                : selectedSchool?.name || 'Sekolah'
            }
            isEditable={isSuperAdmin}
            onRadiusChange={(r) => setEditRadius(r)}
            onCoordinatesChange={(lat, lng) => {
              setEditLat(lat);
              setEditLng(lng);
            }}
          />

          {/* Exact Location & Profile Summary Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  {selectedTargetType === 'PPD'
                    ? 'Pejabat Pendidikan Daerah Tuaran (Ibu Pejabat)'
                    : selectedSchool?.name}
                </span>
                <Badge
                  variant={selectedTargetType === 'PPD' ? 'teal' : 'primary'}
                  size="sm"
                >
                  {selectedTargetType === 'PPD' ? 'PPD-HQ' : selectedSchool?.code}
                </Badge>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Koordinat Disahkan
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {selectedTargetType === 'PPD'
                  ? ppdOffice.address
                  : selectedSchool?.address || 'Tuaran, Sabah'}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Latitud: {editLat.toFixed(6)} | Longitud: {editLng.toFixed(6)} | Perimeter:{' '}
                {editRadius}m
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://www.openstreetmap.org/?mlat=${editLat}&mlon=${editLng}#map=17/${editLat}/${editLng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
              >
                <span>Buka di OpenStreetMap</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
