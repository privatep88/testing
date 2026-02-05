
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import SecondaryHeader from './components/SecondaryHeader'; // Acts as Sidebar
import LicenseManagement from './components/LicenseManagement';
import ContractManagement from './components/ContractManagement';
import SpecialAgenciesManagement from './components/OtherTopics';
import SupplierContractsManagement from './components/SupplierContractsManagement';
import AllRecordsManagement from './components/AllRecordsManagement';
import ArchiveManagement from './components/ArchiveManagement';
import Modal from './components/Modal';
import RecordForm from './components/RecordForm';
import Footer from './components/Footer';
import type { Tab, RecordType, RecordDataType, License, Contract, Procedure, ArchivedRecord } from './types';
import { RecordStatus } from './types';
import { TABS, MOCK_COMMERCIAL_LICENSES, MOCK_OPERATIONAL_LICENSES, MOCK_CIVIL_DEFENSE_CERTS, MOCK_SPECIAL_AGENCIES, MOCK_LEASE_CONTRACTS, MOCK_GENERAL_CONTRACTS, MOCK_PROCEDURES, ADMIN_EMAIL, MOCK_OTHER_TOPICS, MOCK_TRADEMARK_CERTS } from './constants';
import OtherTopicsContent from './components/OtherTopicsContent';
import ProceduresManagement from './components/ProceduresManagement';
import NotificationBanner from './components/NotificationBanner';
import TrademarkManagement from './components/TrademarkManagement';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import { SaveIcon, CheckIcon } from './components/icons/ActionIcons';

const getOverallStatus = (statuses: (RecordStatus | undefined)[]): RecordStatus => {
    const validStatuses = statuses.filter(Boolean) as RecordStatus[];
    if (validStatuses.includes(RecordStatus.Expired)) {
        return RecordStatus.Expired;
    }
    if (validStatuses.includes(RecordStatus.SoonToExpire)) {
        return RecordStatus.SoonToExpire;
    }
    return RecordStatus.Active;
};

// Moved helper outside to avoid dependency cycles and ensure it's available for init logic
const getCalculatedStatus = (expiryDate: string | undefined): RecordStatus => {
    if (!expiryDate) {
        return RecordStatus.Active; // Default if no date
    }
    const now = new Date();
    // Use start of day for consistent comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); 

    const parts = expiryDate.split('-');
    if (parts.length !== 3) return RecordStatus.Active;
    
    // Create expiry date at start of day, local time
    const expiry = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    
    if (isNaN(expiry.getTime())) {
        return RecordStatus.Active; // Invalid date
    }

    if (expiry < today) {
        return RecordStatus.Expired;
    }

    const fourMonthsFromNow = new Date(today);
    fourMonthsFromNow.setDate(today.getDate() + 120); // 4 months = 120 days

    if (expiry <= fourMonthsFromNow) {
        return RecordStatus.SoonToExpire;
    }

    return RecordStatus.Active;
};

const STORAGE_KEY = 'SAHER_APP_DATA_V1';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(TABS[0]);
  
  // Data States
  const [commercialLicenses, setCommercialLicenses] = useState<License[]>([]);
  const [operationalLicenses, setOperationalLicenses] = useState<License[]>([]);
  const [civilDefenseCerts, setCivilDefenseCerts] = useState<License[]>([]);
  const [specialAgencies, setSpecialAgencies] = useState<License[]>([]);
  const [leaseContracts, setLeaseContracts] = useState<Contract[]>([]);
  const [generalContracts, setGeneralContracts] = useState<License[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [otherTopicsData, setOtherTopicsData] = useState<License[]>([]);
  const [trademarkCerts, setTrademarkCerts] = useState<License[]>([]);
  const [archivedRecords, setArchivedRecords] = useState<ArchivedRecord[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Notification State
  const [expiringItems, setExpiringItems] = useState<Array<License | Contract>>([]);
  const [showNotification, setShowNotification] = useState(false);

  // Save Confirmation State
  const [saveSuccess, setSaveSuccess] = useState(false);
  const isInitialMount = useRef(true); // Ref to track initial load

  // Modal State
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean; record?: RecordType | ArchivedRecord; type?: RecordDataType }>({ isOpen: false });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; record?: RecordType | ArchivedRecord; type?: RecordDataType; isPermanent?: boolean }>({ isOpen: false });


  // Initial Data Loading Effect (Load from LocalStorage or Fallback to Mocks)
  useEffect(() => {
    const processLicenses = (licenses: License[]): License[] => 
        licenses.map(l => ({ ...l, status: getCalculatedStatus(l.expiryDate) }));
        
    const processContracts = (contracts: Contract[]): Contract[] => 
        contracts.map(c => {
            const documentedStatus = c.documentedExpiryDate ? getCalculatedStatus(c.documentedExpiryDate) : undefined;
            const internalStatus = c.internalExpiryDate ? getCalculatedStatus(c.internalExpiryDate) : undefined;
            const status = getOverallStatus([documentedStatus, internalStatus]);
            return {
                ...c,
                documentedStatus,
                internalStatus,
                status
            };
        });

    const loadData = () => {
        const savedData = localStorage.getItem(STORAGE_KEY);
        let data;

        if (savedData) {
            try {
                data = JSON.parse(savedData);
            } catch (e) {
                console.error("Failed to parse saved data", e);
            }
        }

        if (data) {
             // Load and Recalculate statuses based on current date
             setCommercialLicenses(processLicenses(data.commercialLicenses || []));
             setOperationalLicenses(processLicenses(data.operationalLicenses || []));
             setCivilDefenseCerts(processLicenses(data.civilDefenseCerts || []));
             setSpecialAgencies(processLicenses(data.specialAgencies || []));
             setLeaseContracts(processContracts(data.leaseContracts || []));
             setGeneralContracts(processLicenses(data.generalContracts || []));
             setProcedures(data.procedures || []);
             setOtherTopicsData(processLicenses(data.otherTopicsData || []));
             setTrademarkCerts(processLicenses(data.trademarkCerts || []));
             setArchivedRecords(data.archivedRecords || []);
        } else {
             // Fallback to Mocks if no saved data
             setCommercialLicenses(processLicenses(MOCK_COMMERCIAL_LICENSES));
             setOperationalLicenses(processLicenses(MOCK_OPERATIONAL_LICENSES));
             setCivilDefenseCerts(processLicenses(MOCK_CIVIL_DEFENSE_CERTS));
             setSpecialAgencies(processLicenses(MOCK_SPECIAL_AGENCIES));
             setLeaseContracts(processContracts(MOCK_LEASE_CONTRACTS));
             setGeneralContracts(processLicenses(MOCK_GENERAL_CONTRACTS));
             setProcedures(MOCK_PROCEDURES);
             setOtherTopicsData(processLicenses(MOCK_OTHER_TOPICS));
             setTrademarkCerts(processLicenses(MOCK_TRADEMARK_CERTS));
             setArchivedRecords([]);
        }
    };

    loadData();
  }, []);

  // AUTO SAVE EFFECT
  useEffect(() => {
    const dataToSave = {
        commercialLicenses,
        operationalLicenses,
        civilDefenseCerts,
        specialAgencies,
        leaseContracts,
        generalContracts,
        procedures,
        otherTopicsData,
        trademarkCerts,
        archivedRecords
    };

    const isAnyDataPresent = Object.values(dataToSave).some(arr => Array.isArray(arr) && arr.length > 0);
    if (!isAnyDataPresent && isInitialMount.current) {
        return;
    }

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setSaveSuccess(true);
            const timer = setTimeout(() => setSaveSuccess(false), 2000);
            return () => clearTimeout(timer);
        }
    } catch (e) {
        console.error("Auto-save failed", e);
    }
  }, [
      commercialLicenses,
      operationalLicenses,
      civilDefenseCerts,
      specialAgencies,
      leaseContracts,
      generalContracts,
      procedures,
      otherTopicsData,
      trademarkCerts,
      archivedRecords
  ]);

  // Global Save Handler
  const handleGlobalSave = () => {
      const dataToSave = {
          commercialLicenses,
          operationalLicenses,
          civilDefenseCerts,
          specialAgencies,
          leaseContracts,
          generalContracts,
          procedures,
          otherTopicsData,
          trademarkCerts,
          archivedRecords
      };
      
      try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
      } catch (e) {
          console.error("Failed to save data", e);
          alert("حدث خطأ أثناء حفظ البيانات. يرجى المحاولة مرة أخرى.");
      }
  };

  const handleBackup = () => {
      const dataToSave = {
          commercialLicenses,
          operationalLicenses,
          civilDefenseCerts,
          specialAgencies,
          leaseContracts,
          generalContracts,
          procedures,
          otherTopicsData,
          trademarkCerts,
          archivedRecords,
          backupDate: new Date().toISOString()
      };
      
      const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().split('T')[0];
      link.download = `SAHER_Backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target?.result as string);
              const knownKeys = ['commercialLicenses', 'leaseContracts', 'operationalLicenses', 'procedures'];
              const isValid = knownKeys.some(key => Array.isArray(json[key]));

              if (!isValid) {
                  throw new Error("Invalid backup file format");
              }

              if (window.confirm("هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.")) {
                  const dataToRestore = {
                      commercialLicenses: json.commercialLicenses || [],
                      operationalLicenses: json.operationalLicenses || [],
                      civilDefenseCerts: json.civilDefenseCerts || [],
                      specialAgencies: json.specialAgencies || [],
                      leaseContracts: json.leaseContracts || [],
                      generalContracts: json.generalContracts || [],
                      procedures: json.procedures || [],
                      otherTopicsData: json.otherTopicsData || [],
                      trademarkCerts: json.trademarkCerts || [],
                      archivedRecords: json.archivedRecords || []
                  };

                  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToRestore));
                  alert("تم استعادة النسخة الاحتياطية بنجاح.");
                  window.location.reload();
              }
          } catch (err) {
              console.error(err);
              alert("فشل في استعادة النسخة الاحتياطية. تأكد من صحة الملف.");
          }
      };
      reader.readAsText(file);
  };

  // Notification Logic
  useEffect(() => {
    const allRecords = [
        ...commercialLicenses,
        ...operationalLicenses,
        ...civilDefenseCerts,
        ...specialAgencies,
        ...leaseContracts,
        ...generalContracts,
        ...otherTopicsData,
        ...trademarkCerts
    ];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thresholdDate = new Date(today);
    thresholdDate.setDate(today.getDate() + 120); 

    const expiring = allRecords.filter(item => {
        const datesToCheck: string[] = [];
        if ('expiryDate' in item && item.expiryDate) {
            datesToCheck.push(item.expiryDate);
        }
        if ('documentedExpiryDate' in item && item.documentedExpiryDate) {
            datesToCheck.push(item.documentedExpiryDate);
        }
        if ('internalExpiryDate' in item && item.internalExpiryDate) {
            datesToCheck.push(item.internalExpiryDate);
        }

        return datesToCheck.some(dateStr => {
            const parts = dateStr.split('-');
            if (parts.length !== 3) return false;
            const dDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            return dDate <= thresholdDate;
        });
    });

    setExpiringItems(expiring);

    const todayStr = new Date().toISOString().split('T')[0];
    const lastCheck = localStorage.getItem('lastEmailCheckDate');
    
    if (expiring.length > 0) {
        if (lastCheck !== todayStr || sessionStorage.getItem('notificationDismissed') !== 'true') {
            setShowNotification(true);
        }
        localStorage.setItem('lastEmailCheckDate', todayStr);
    } else {
        setShowNotification(false);
    }

  }, [
      commercialLicenses, 
      operationalLicenses, 
      civilDefenseCerts, 
      specialAgencies, 
      leaseContracts, 
      generalContracts, 
      otherTopicsData, 
      trademarkCerts
  ]);


  const handleAdd = (type: RecordDataType) => {
    setModalInfo({ isOpen: true, type: type, record: undefined });
  };

  const handleEdit = (record: RecordType | ArchivedRecord, type: RecordDataType) => {
    setModalInfo({ isOpen: true, type: type, record: record });
  };

  const handleCloseModal = () => {
    setModalInfo({ isOpen: false, type: undefined, record: undefined });
  };
  
  const handleDelete = (recordToDelete: RecordType, type: RecordDataType) => {
    setDeleteConfirmation({ isOpen: true, record: recordToDelete, type: type, isPermanent: false });
  };

  const handlePermanentDelete = (recordToDelete: ArchivedRecord) => {
    setDeleteConfirmation({ isOpen: true, record: recordToDelete, type: recordToDelete.originalType, isPermanent: true });
  };

  const handleRestore = (item: ArchivedRecord) => {
      setArchivedRecords(prev => prev.filter(r => r.id !== item.id));
      const originalRecord = item.originalData;
      
      const setters: Partial<Record<RecordDataType, React.Dispatch<React.SetStateAction<any[]>>>> = {
        commercialLicense: setCommercialLicenses,
        operationalLicense: setOperationalLicenses,
        civilDefenseCert: setCivilDefenseCerts,
        specialAgency: setSpecialAgencies,
        leaseContract: setLeaseContracts,
        generalContract: setGeneralContracts,
        procedure: setProcedures,
        otherTopic: setOtherTopicsData,
        trademarkCert: setTrademarkCerts,
      };

      const setter = setters[item.originalType];
      if (setter) {
          setter(prev => [...prev, originalRecord]);
      }
      alert("تم استعادة السجل بنجاح");
  };

  const handleConfirmDelete = () => {
    const { record: recordToDelete, type, isPermanent } = deleteConfirmation;
    if (!recordToDelete || !type) return;

    if (isPermanent) {
        setArchivedRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
    } else {
        const record = recordToDelete as RecordType;
        const archivedItem: ArchivedRecord = {
            ...record as any,
            originalType: type,
            deletionDate: new Date().toISOString(),
            originalData: record
        };
        setArchivedRecords(prev => [archivedItem, ...prev]);

        const setters: Partial<Record<RecordDataType, React.Dispatch<React.SetStateAction<any[]>>>> = {
            commercialLicense: setCommercialLicenses,
            operationalLicense: setOperationalLicenses,
            civilDefenseCert: setCivilDefenseCerts,
            specialAgency: setSpecialAgencies,
            leaseContract: setLeaseContracts,
            generalContract: setGeneralContracts,
            procedure: setProcedures,
            otherTopic: setOtherTopicsData,
            trademarkCert: setTrademarkCerts,
        };

        const setter = setters[type];
        if (setter) {
            setter(prev => prev.filter(r => r.id !== recordToDelete.id));
        }
    }

    setDeleteConfirmation({ isOpen: false, record: undefined, type: undefined, isPermanent: false });
  };

  const handleSave = (recordToSave: RecordType) => {
    const { type } = modalInfo;
    const isArchivedEdit = activeTab.id === 'archive';

    if (isArchivedEdit) {
        setArchivedRecords(prev => prev.map(item => {
             if (item.id === recordToSave.id) {
                 return {
                     ...item,
                     ...recordToSave,
                     originalData: { ...item.originalData, ...recordToSave }
                 };
             }
             return item;
        }));
        handleCloseModal();
        return;
    }

    let recordWithStatus: RecordType;
        
    if (type === 'leaseContract') {
        const contract = recordToSave as Contract;
        const documentedStatus = contract.documentedExpiryDate ? getCalculatedStatus(contract.documentedExpiryDate) : undefined;
        const internalStatus = contract.internalExpiryDate ? getCalculatedStatus(contract.internalExpiryDate) : undefined;
        const overallStatus = getOverallStatus([documentedStatus, internalStatus]);
        recordWithStatus = {
            ...contract,
            documentedStatus,
            internalStatus,
            status: overallStatus,
        };
    } else {
        let calculatedStatus: RecordStatus | undefined;
        if ('expiryDate' in recordToSave && recordToSave.expiryDate) {
            calculatedStatus = getCalculatedStatus(recordToSave.expiryDate);
        } else {
            calculatedStatus = 'status' in recordToSave ? recordToSave.status : RecordStatus.Active;
        }
        recordWithStatus = {
            ...recordToSave,
            ...(calculatedStatus && { status: calculatedStatus }),
        };
    }
        
    const isNew = !recordToSave.id;

    const updateList = <T extends {id: number}>(setter: React.Dispatch<React.SetStateAction<T[]>>, item: T) => {
        if(isNew) {
            setter(prev => [...prev, { ...item, id: Date.now() }]);
        } else {
            setter(prev => prev.map(r => r.id === item.id ? item : r));
        }
    };
    
    const licenseSetters: Partial<Record<RecordDataType, React.Dispatch<React.SetStateAction<License[]>>>> = {
      commercialLicense: setCommercialLicenses,
      operationalLicense: setOperationalLicenses,
      civilDefenseCert: setCivilDefenseCerts,
      specialAgency: setSpecialAgencies,
      generalContract: setGeneralContracts,
      otherTopic: setOtherTopicsData,
      trademarkCert: setTrademarkCerts,
    };
    
    if (type && type in licenseSetters) {
      const setter = licenseSetters[type];
      if (setter) {
        updateList(setter, recordWithStatus as License);
      }
    } else if (type === 'leaseContract') {
      updateList(setLeaseContracts, recordWithStatus as Contract);
    } else if (type === 'procedure') {
      updateList(setProcedures, recordToSave as Procedure);
    }

    handleCloseModal();
  };
  
  // Filter Logic
  const lowercasedQuery = searchQuery.toLowerCase();
  
  const filteredCommercialLicenses = commercialLicenses.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredOperationalLicenses = operationalLicenses.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredCivilDefenseCerts = civilDefenseCerts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredSpecialAgencies = specialAgencies.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredLeaseContracts = leaseContracts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredGeneralContracts = generalContracts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredOtherTopicsData = otherTopicsData.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );
  
  const filteredTrademarkCerts = trademarkCerts.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredProcedures = procedures.filter(item =>
    item.licenseName.toLowerCase().includes(lowercasedQuery) ||
    item.authority.toLowerCase().includes(lowercasedQuery) ||
    item.contactNumbers.toLowerCase().includes(lowercasedQuery) ||
    item.email.toLowerCase().includes(lowercasedQuery) ||
    item.websiteName.toLowerCase().includes(lowercasedQuery) ||
    item.websiteUrl.toLowerCase().includes(lowercasedQuery) ||
    item.username.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  const filteredArchivedRecords = archivedRecords.filter(item =>
    item.name.toLowerCase().includes(lowercasedQuery) ||
    item.number.toLowerCase().includes(lowercasedQuery) ||
    item.notes?.toLowerCase().includes(lowercasedQuery)
  );

  // Calculate Tab Counts
  const tabCounts = useMemo(() => {
    const allRecordsCount = filteredCommercialLicenses.length + 
                    filteredOperationalLicenses.length + 
                    filteredCivilDefenseCerts.length + 
                    filteredLeaseContracts.length + 
                    filteredGeneralContracts.length + 
                    filteredSpecialAgencies.length + 
                    filteredTrademarkCerts.length + 
                    filteredOtherTopicsData.length;

    return {
        dashboard: allRecordsCount + filteredProcedures.length,
        licenses: filteredCommercialLicenses.length + filteredOperationalLicenses.length + filteredCivilDefenseCerts.length,
        contracts: filteredLeaseContracts.length,
        supplierContracts: filteredGeneralContracts.length,
        other: filteredSpecialAgencies.length,
        trademarks: filteredTrademarkCerts.length,
        otherTopics: filteredOtherTopicsData.length,
        procedures: filteredProcedures.length,
        allRecords: allRecordsCount,
        calendar: 0,
        archive: filteredArchivedRecords.length
    };
  }, [
    filteredCommercialLicenses, 
    filteredOperationalLicenses, 
    filteredCivilDefenseCerts, 
    filteredLeaseContracts, 
    filteredGeneralContracts, 
    filteredSpecialAgencies, 
    filteredTrademarkCerts, 
    filteredOtherTopicsData, 
    filteredProcedures,
    filteredArchivedRecords
  ]);

  const handleSendNotificationEmail = () => {
    const subject = "تنبيه هام: سجلات تحولت إلى حالة قاربت على الانتهاء";
    const body = `
        تحية طيبة,

        يرجى العلم بأن السجلات التالية قد دخلت في فترة التنبيه (أقل من 4 أشهر) أو انتهت صلاحيتها:

        ${expiringItems.map(item =>
          `- ${item.name} (رقم: ${item.number}) - تاريخ الانتهاء: ${'expiryDate' in item ? item.expiryDate : item.documentedExpiryDate}`
        ).join('\n')}

        يرجى اتخاذ الإجراءات اللازمة للبدء في إجراءات التجديد.

        مع تحيات,
        نظام إدارة الرخص والعقود - ساهر
    `;
    
    const mailtoLink = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleDismissNotification = () => {
    setShowNotification(false);
    sessionStorage.setItem('notificationDismissed', 'true');
  };

  const renderContent = () => {
    switch (activeTab.id) {
      case 'dashboard':
        return <Dashboard 
                    commercialLicenses={filteredCommercialLicenses}
                    operationalLicenses={filteredOperationalLicenses}
                    civilDefenseCerts={filteredCivilDefenseCerts}
                    leaseContracts={filteredLeaseContracts}
                    generalContracts={filteredGeneralContracts}
                    specialAgencies={filteredSpecialAgencies}
                    trademarkCerts={filteredTrademarkCerts}
                    otherTopics={filteredOtherTopicsData}
                    procedures={filteredProcedures}
                />;
      case 'licenses':
        return <LicenseManagement 
                    commercialLicenses={filteredCommercialLicenses}
                    operationalLicenses={filteredOperationalLicenses}
                    civilDefenseCerts={filteredCivilDefenseCerts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'contracts':
        return <ContractManagement 
                    contracts={filteredLeaseContracts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'other':
        return <SpecialAgenciesManagement 
                    agencies={filteredSpecialAgencies}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'supplierContracts':
        return <SupplierContractsManagement
                    generalContracts={filteredGeneralContracts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'otherTopics':
        return <OtherTopicsContent
                    topics={filteredOtherTopicsData}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'procedures':
        return <ProceduresManagement
                    procedures={filteredProcedures}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'trademarks':
        return <TrademarkManagement
                    certificates={filteredTrademarkCerts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
      case 'allRecords':
        return <AllRecordsManagement
                  commercialLicenses={filteredCommercialLicenses}
                  operationalLicenses={filteredOperationalLicenses}
                  civilDefenseCerts={filteredCivilDefenseCerts}
                  leaseContracts={filteredLeaseContracts}
                  generalContracts={filteredGeneralContracts}
                  specialAgencies={filteredSpecialAgencies}
                  trademarkCerts={filteredTrademarkCerts}
                  otherTopics={filteredOtherTopicsData}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
               />;
      case 'calendar':
         const calendarItems = [
            ...filteredCommercialLicenses.map(i => ({ ...i, _type: 'commercialLicense' as RecordDataType })),
            ...filteredOperationalLicenses.map(i => ({ ...i, _type: 'operationalLicense' as RecordDataType })),
            ...filteredCivilDefenseCerts.map(i => ({ ...i, _type: 'civilDefenseCert' as RecordDataType })),
            ...filteredLeaseContracts.map(i => ({ ...i, _type: 'leaseContract' as RecordDataType })),
            ...filteredGeneralContracts.map(i => ({ ...i, _type: 'generalContract' as RecordDataType })),
            ...filteredSpecialAgencies.map(i => ({ ...i, _type: 'specialAgency' as RecordDataType })),
            ...filteredTrademarkCerts.map(i => ({ ...i, _type: 'trademarkCert' as RecordDataType })),
            ...filteredOtherTopicsData.map(i => ({ ...i, _type: 'otherTopic' as RecordDataType })),
        ];
        return <CalendarView 
                  items={calendarItems}
                  onEdit={(item: any) => handleEdit(item, item._type)}
               />;
      case 'archive':
        return <ArchiveManagement 
                 archivedRecords={filteredArchivedRecords}
                 onRestore={handleRestore}
                 onDeleteForever={handlePermanentDelete}
                 onEdit={(item) => handleEdit(item, item.originalType)}
               />;
      default:
        return <LicenseManagement 
                    commercialLicenses={filteredCommercialLicenses}
                    operationalLicenses={filteredOperationalLicenses}
                    civilDefenseCerts={filteredCivilDefenseCerts}
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-gray-800 overflow-hidden font-sans">
      
      {/* Sidebar (Formerly SecondaryHeader) */}
      <SecondaryHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        counts={tabCounts} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
          
          {/* Top Header */}
          <Header 
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onBackup={handleBackup}
            onRestore={handleRestoreBackup}
          />
          
          <main className="flex-1 overflow-y-auto bg-slate-50 relative custom-scrollbar">
            <div className="max-w-7xl mx-auto p-6 md:p-8">
                
                {showNotification && expiringItems.length > 0 && (
                    <NotificationBanner 
                        items={expiringItems}
                        onSendEmail={handleSendNotificationEmail}
                        onDismiss={handleDismissNotification}
                    />
                )}

                 {/* Tab Title (Breadcrumb style) */}
                 <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                    <span>الرئيسية</span>
                    <svg className="w-4 h-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className="font-bold text-slate-800">{activeTab.name}</span>
                 </div>

                {renderContent()}

                {/* Floating Save Button */}
                <div className="fixed bottom-8 left-8 z-50">
                    <button
                        onClick={handleGlobalSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl shadow-blue-600/30 transition-all hover:scale-110 flex items-center justify-center group"
                        aria-label="حفظ التغييرات"
                        title="حفظ التغييرات"
                    >
                        <SaveIcon />
                        {saveSuccess && (
                            <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap animate-fade-in-up">
                                تم الحفظ!
                            </span>
                        )}
                    </button>
                </div>
            </div>
             <Footer />
          </main>
      </div>

      <Modal isOpen={modalInfo.isOpen} onClose={handleCloseModal} title={modalInfo.record ? "تعديل السجل" : "إضافة سجل جديد"}>
        {modalInfo.isOpen && (
            <RecordForm
                initialData={modalInfo.record}
                type={modalInfo.type!}
                onSave={handleSave}
                onCancel={handleCloseModal}
            />
        )}
      </Modal>

      <Modal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false })}
        title={deleteConfirmation.isPermanent ? "حذف نهائي" : "حذف السجل"}
        size="sm"
      >
        <div className="text-center p-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-6">
            <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
              {deleteConfirmation.isPermanent ? "هل أنت متأكد من الحذف النهائي؟" : "نقل إلى الأرشيف"}
          </h3>
          <p className="text-sm text-gray-500 mb-8">
              {deleteConfirmation.isPermanent 
                ? "سيتم حذف هذا السجل بشكل دائم ولا يمكن استعادته مرة أخرى. هذا الإجراء لا يمكن التراجع عنه."
                : "سيتم نقل السجل إلى الأرشيف. يمكنك استعادته لاحقاً في أي وقت."
              }
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setDeleteConfirmation({ isOpen: false })}
              className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء الأمر
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-md shadow-red-500/20 transition-all"
            >
              {deleteConfirmation.isPermanent ? "حذف نهائي" : "نقل للأرشيف"}
            </button>
          </div>
        </div>
      </Modal>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #cbd5e1;
            border-radius: 20px;
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translate(-50%, 10px); }
            to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default App;
