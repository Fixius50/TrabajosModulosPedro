import React, { useState, useRef } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonList, IonProgressBar, IonIcon, IonItemDivider } from '@ionic/react';
import { cloudUploadOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { parseCSV, normalizeTransaction, type CSVRow, type ImportMapping } from '../services/importService';
import { upsertTransaction } from '../services/transactionService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const ImportModal: React.FC<Props> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [csvData, setCsvData] = useState<CSVRow[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<ImportMapping>({ date_col: '', amount_col: '', desc_col: '' });
    const [loading, setLoading] = useState(false);
    const [importedCount, setImportedCount] = useState(0);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLoading(true);
            try {
                const data = await parseCSV(file);
                if (data.length > 0) {
                    setCsvData(data);
                    setHeaders(Object.keys(data[0]));
                    setStep(2);
                }
            } catch (err) {
                console.error(err);
                alert('Error parsing CSV');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleImport = async () => {
        setLoading(true);
        let count = 0;
        try {
            for (const row of csvData) {
                const trans = normalizeTransaction(row, mapping);
                if (trans.amount && trans.date && trans.description) {
                    // cast to any to avoid strict type checks on ID which is missing here but handled by DB defaults
                    await upsertTransaction(trans as any);
                    count++;
                }
            }
            setImportedCount(count);
            setStep(3);
        } catch (err) {
            console.error(err);
            alert('Error importing data');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setStep(1);
        setCsvData([]);
        setImportedCount(0);
        setMapping({ date_col: '', amount_col: '', desc_col: '' });
        onClose();
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={reset}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{t('settings.import_csv') || 'Importar CSV'}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={reset}>{t('transactions.cancel')}</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                {step === 1 && (
                    <div className="ion-text-center ion-padding-top">
                        <IonIcon icon={cloudUploadOutline} size="large" color="primary" />
                        <h2>Selecciona tu archivo bancario (.csv)</h2>
                        <input
                            type="file"
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <IonButton expand="block" onClick={() => fileInputRef.current?.click()} className="ion-margin-top">
                            Seleccionar CSV
                        </IonButton>
                        {loading && <IonProgressBar type="indeterminate" className="ion-margin-top" />}
                    </div>
                )}

                {step === 2 && (
                    <IonList>
                        <IonItem lines="none">
                            <IonLabel className="ion-text-wrap">
                                <p>Detectamos <strong>{csvData.length}</strong> filas.</p>
                                <p>Ayúdanos a identificar las columnas:</p>
                            </IonLabel>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">Columna de Fecha</IonLabel>
                            <IonSelect value={mapping.date_col} onIonChange={e => setMapping({ ...mapping, date_col: e.detail.value })}>
                                {headers.map(h => <IonSelectOption key={h} value={h}>{h}</IonSelectOption>)}
                            </IonSelect>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">Columna de Descripción/Concepto</IonLabel>
                            <IonSelect value={mapping.desc_col} onIonChange={e => setMapping({ ...mapping, desc_col: e.detail.value })}>
                                {headers.map(h => <IonSelectOption key={h} value={h}>{h}</IonSelectOption>)}
                            </IonSelect>
                        </IonItem>

                        <IonItem>
                            <IonLabel position="stacked">Columna de Importe/Cantidad</IonLabel>
                            <IonSelect value={mapping.amount_col} onIonChange={e => setMapping({ ...mapping, amount_col: e.detail.value })}>
                                {headers.map(h => <IonSelectOption key={h} value={h}>{h}</IonSelectOption>)}
                            </IonSelect>
                        </IonItem>

                        <IonButton
                            expand="block"
                            className="ion-margin-top"
                            disabled={!mapping.date_col || !mapping.amount_col || !mapping.desc_col || loading}
                            onClick={handleImport}
                        >
                            {loading ? 'Importando...' : `Importar ${csvData.length} Movimientos`}
                        </IonButton>
                        {loading && <IonProgressBar type="indeterminate" />}

                        {/* Preview */}
                        <IonItemDivider className="ion-margin-top">
                            <IonLabel>Previsualización (Fila 1)</IonLabel>
                        </IonItemDivider>
                        {csvData.length > 0 && mapping.amount_col && (
                            <IonItem lines="none" color="light">
                                <IonLabel className="ion-text-wrap">
                                    <p>Fecha: {csvData[0][mapping.date_col]}</p>
                                    <p>Desc: {csvData[0][mapping.desc_col]}</p>
                                    <p>Monto: {csvData[0][mapping.amount_col]}</p>
                                </IonLabel>
                            </IonItem>
                        )}
                    </IonList>
                )}

                {step === 3 && (
                    <div className="ion-text-center ion-padding-top">
                        <IonIcon icon={checkmarkCircleOutline} size="large" color="success" />
                        <h2>¡Importación Exitosa!</h2>
                        <p>Se han guardado <strong>{importedCount}</strong> movimientos.</p>
                        <IonButton expand="block" onClick={reset} className="ion-margin-top">
                            Finalizar
                        </IonButton>
                    </div>
                )}
            </IonContent>
        </IonModal>
    );
};

export default ImportModal;
