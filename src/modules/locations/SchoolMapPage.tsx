import React, { useState, useMemo } from 'react';
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
import { School, Zone } from '@/types';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { InteractiveGeofenceMap } from '@/components/maps/InteractiveGeofenceMap';
import { PPD_TUARAN_OFFICE } from '@/lib/geofence';

export const SchoolMapPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [schools, setSchools] = useState<School[]>(() => dbService.getSchools());
  const zones = useMemo(() => dbService.getZones(), []);

  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(
    schools[0]?.id || ''
  );
  const [searchFilter, setSearchFilter] = useState('');

  const selectedSchool = useMemo(() => {
    return schools.find((s) => s.id === selectedSchoolId) || schools[0];
  }, [schools, selectedSchoolId]);

  // Local map editing states
  const [editLat, setEditLat] = useState<number>(selectedSchool ? selectedSchool.latitude : 6.134);
  const [editLng, setEditLng] = useState<number>(selectedSchool ? selectedSchool.longitude : 116.23);
  const [editRadius, setEditRadius] = useState<number>(
    selectedSchool ? selectedSchool.geofence_radius_meters : 100
  );

  // Sync when selected school changes
  React.useEffect(() => {
    if (selectedSchool) {
      setEditLat(selectedSchool.latitude);
      setEditLng(selectedSchool.longitude);
      setEditRadius(selectedSchool.geofence_radius_meters);
    }
  }, [selectedSchool]);

  const handleSaveGeofence = () => {
    if (!user || !selectedSchool) return;
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
            Peta Lokasi Sekolah & Kawalan Geofence
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi peta interaktif, semakan koordinat GPS sekolah, dan konfigurasi perimeter kehadiran sah (50m - 500m).
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveGeofence}
            icon={<Save className="w-4 h-4" />}
          >
            Simpan Tetapan Geofence
          </Button>
        )}
      </div>

      {/* Approved Locations Info Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <SchoolIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-blue-900 uppercase">1. Lokasi Sekolah Masing-Masing</h4>
              <Badge variant="success" size="sm">Diluluskan</Badge>
            </div>
            <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
              Setiap PGB dibenarkan membuat imbasan clock-in/out dalam perimeter geofence sekolah yang ditugaskan.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200/80 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-teal-900 uppercase">2. Pejabat Pendidikan Daerah Tuaran</h4>
              <Badge variant="success" size="sm">Pusat PPD (150m)</Badge>
            </div>
            <p className="text-[11px] text-teal-700 mt-0.5 leading-relaxed">
              PPD Tuaran (Lat: 6.1341, Long: 116.2305) dikonfigurasikan sebagai lokasi kehadiran sah untuk semua PGB semasa taklimat/urusan rasmi.
            </p>
          </div>
        </div>
      </div>

      {/* Main Map + School Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: School Selection List */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col h-[520px]">
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
              const isSelected = school.id === selectedSchoolId;
              const zone = zones.find((z) => z.id === school.zone_id);

              return (
                <div
                  key={school.id}
                  onClick={() => setSelectedSchoolId(school.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-200 shadow-xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
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
          {selectedSchool ? (
            <>
              <InteractiveGeofenceMap
                latitude={editLat}
                longitude={editLng}
                radiusMeters={editRadius}
                schoolName={selectedSchool.name}
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
                    <span className="text-xs font-bold text-slate-900">{selectedSchool.name}</span>
                    <Badge variant="primary" size="sm">{selectedSchool.code}</Badge>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lokasi GPS Disahkan
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedSchool.address || 'Tuaran, Sabah'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Latitud: {editLat.toFixed(6)} | Longitud: {editLng.toFixed(6)} | Perimeter: {editRadius}m
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
            </>
          ) : (
            <div className="h-96 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 text-xs">
              Sila pilih sekolah untuk melihat peta geofence
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

