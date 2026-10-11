import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectActiveAddress,
  selectSavedAddresses,
  selectIsAddressModalOpen,
  setActiveAddress,
  saveAddress,
  deleteAddress,
  closeAddressModal,
} from '../../features/address/addressSlice';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import {
  X, MapPin, Search, Plus, Home, Briefcase, Heart,
  CheckCircle2, Loader2, AlertCircle, Navigation, Trash2, Save,
} from 'lucide-react';

const TAG_OPTIONS = [
  { value: 'HOME', label: 'Home', Icon: Home },
  { value: 'WORK', label: 'Work', Icon: Briefcase },
  { value: 'OTHER', label: 'Other', Icon: Heart },
];

const tagIcon = (tag) => {
  if (tag === 'WORK') return <Briefcase size={14} />;
  if (tag === 'OTHER') return <Heart size={14} />;
  return <Home size={14} />;
};

export default function AddressModal() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectIsAddressModalOpen);
  const activeAddress = useSelector(selectActiveAddress);
  const savedAddresses = useSelector(selectSavedAddresses);

  const [searchQuery, setSearchQuery] = useState('');

  // Save-location form state (shown after GPS detect)
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [houseNo, setHouseNo] = useState('');
  const [selectedTag, setSelectedTag] = useState('HOME');

  const { status, geoAddress, errorMsg, requestLocation, reset } = useGeoLocation();

  if (!isOpen) return null;

  const filtered = savedAddresses.filter(
    (addr) =>
      addr.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addr.flat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addr.area?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClose = () => {
    dispatch(closeAddressModal());
    reset();
    setShowSaveForm(false);
    setHouseNo('');
    setSelectedTag('HOME');
  };

  // Step 1: Detect GPS location
  const handleDetectGPS = () => {
    setShowSaveForm(false);
    requestLocation((result) => {
      // Don't set active yet — wait for user to confirm + add details
      setShowSaveForm(true);
    });
  };

  // Step 2: Save GPS location with house number + tag
  const handleSaveGPSLocation = () => {
    if (!geoAddress) return;
    const tagLabel = TAG_OPTIONS.find((t) => t.value === selectedTag)?.label || 'Home';
    const savedAddr = {
      id: `saved-gps-${Date.now()}`,
      label: tagLabel,
      flat: houseNo.trim() ? `${houseNo.trim()}, ${geoAddress.flat}` : geoAddress.flat,
      area: geoAddress.area,
      tag: selectedTag,
      lat: geoAddress.lat,
      lng: geoAddress.lng,
    };
    dispatch(saveAddress(savedAddr));
    setShowSaveForm(false);
    setHouseNo('');
    setSelectedTag('HOME');
    reset();
  };

  const handleUseWithoutSaving = () => {
    if (!geoAddress) return;
    dispatch(setActiveAddress({
      ...geoAddress,
      id: 'gps-current',
      label: 'Current Location',
      tag: 'GPS',
    }));
    setShowSaveForm(false);
    reset();
  };

  const handleSelectAddress = (addr) => {
    dispatch(setActiveAddress(addr));
  };

  const handleDeleteAddress = (e, id) => {
    e.stopPropagation();
    dispatch(deleteAddress(id));
  };

  const gpsButtonLabel = () => {
    if (status === 'loading') return 'Detecting location...';
    if (status === 'success') return 'Location Detected — Save it below';
    return 'Auto Detect My Location';
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex flex-col justify-end transition-opacity">
      <div className="bg-white rounded-t-3xl max-h-[90%] overflow-y-auto space-y-3 p-4 shadow-2xl max-w-[412px] mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              <MapPin size={14} />
            </div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Select Delivery Location</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs hover:bg-slate-200"
          >
            <X size={14} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center pt-1">
          <Search size={14} className="absolute left-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search saved addresses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 text-xs text-slate-800 font-medium pl-8 pr-3 py-2.5 rounded-xl border border-transparent focus:border-emerald-500 focus:bg-white outline-none transition-all"
          />
        </div>

        {/* AUTO DETECT BUTTON */}
        <button
          onClick={handleDetectGPS}
          disabled={status === 'loading'}
          className={`w-full border p-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all active:scale-[0.98] ${
            status === 'success'
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : status === 'denied' || status === 'error'
              ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {status === 'loading' ? (
              <Loader2 size={16} className="text-emerald-600 animate-spin flex-shrink-0" />
            ) : status === 'denied' || status === 'error' ? (
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            ) : (
              <Navigation
                size={16}
                className={`flex-shrink-0 ${status === 'success' ? 'text-white fill-white' : 'text-emerald-600'}`}
              />
            )}
            <span className="truncate">{gpsButtonLabel()}</span>
          </div>

          {status === 'loading' ? (
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase flex-shrink-0">
              Fetching...
            </span>
          ) : status === 'success' ? (
            <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full uppercase flex-shrink-0">
              ✓ Got it
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase flex-shrink-0">
              AUTO DETECT
            </span>
          )}
        </button>

        {/* Permission Denied / Error Banner */}
        {(status === 'denied' || status === 'error') && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-red-800">Location Access Failed</p>
              <p className="text-[10px] text-red-600 mt-0.5 leading-relaxed">{errorMsg}</p>
              {status === 'denied' && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Tip: Tap the 🔒 lock icon in your browser address bar → allow Location → then try again.
                </p>
              )}
              <button onClick={reset} className="mt-1.5 text-[10px] font-bold text-red-700 underline">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* SAVE LOCATION FORM — shown after GPS detect success */}
        {showSaveForm && geoAddress && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />
              <p className="text-[11px] font-extrabold text-emerald-800">Location Detected! Save it for faster checkout.</p>
            </div>

            {/* Detected address preview */}
            <div className="bg-white border border-emerald-100 rounded-xl p-2.5">
              <p className="text-[11px] font-bold text-slate-800 truncate">{geoAddress.flat}</p>
              <p className="text-[10px] text-slate-500">{geoAddress.area}</p>
            </div>

            {/* House / Flat number input */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1 block">
                House / Flat No. (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Flat 402, Block B"
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs text-slate-800 font-medium px-3 py-2 rounded-xl focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Label / Tag selector */}
            <div>
              <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider mb-1.5 block">
                Save as
              </label>
              <div className="flex gap-2">
                {TAG_OPTIONS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => setSelectedTag(value)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-extrabold transition-all ${
                      selectedTag === value
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveGPSLocation}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              >
                <Save size={13} />
                Save & Use This Address
              </button>
              <button
                onClick={handleUseWithoutSaving}
                className="text-[10px] text-slate-500 underline px-2 whitespace-nowrap"
              >
                Use without saving
              </button>
            </div>
          </div>
        )}

        {/* Saved Addresses List */}
        <div className="space-y-2 pt-1">
          <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
            {savedAddresses.length > 0 ? 'Saved Addresses' : 'No Saved Addresses Yet'}
          </h4>

          {savedAddresses.length === 0 ? (
            <p className="text-[11px] text-slate-400 text-center py-3">
              Detect your location above and save it to see addresses here.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((addr) => {
                const isSelected = activeAddress?.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-2xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tagIcon(addr.tag)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-900">{addr.label}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase flex-shrink-0">
                            {addr.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mt-0.5 truncate">{addr.flat}</p>
                        <p className="text-[10px] text-slate-400 font-normal truncate">{addr.area}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      {isSelected && (
                        <CheckCircle2 size={18} className="text-emerald-600 fill-emerald-100" />
                      )}
                      <button
                        onClick={(e) => handleDeleteAddress(e, addr.id)}
                        className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New Address manually (placeholder for future) */}
        <button className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 text-slate-600 hover:text-emerald-700 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition">
          <Plus size={16} />
          <span>Detect & Add Another Address</span>
        </button>

      </div>
    </div>
  );
}
