import { faDownload, faFileImport, faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './sync-modal.component.css';

export default function SyncModalComponent() {
    function onSynchroniseApi(formData: FormData) {
        console.warn('SYNCHRONIZING API', {
            apiEndpoint: formData.get('api-endpoint'),
            apiKey: formData.get('api-key'),
        });
    }

    function onExportData() {
        console.warn('EXPORTING DATA AS JSON');
    }

    return (
        <>
            <button
                type="button"
                className="btn btn-primary d-flex gap-1 align-items-center"
                data-bs-toggle="modal"
                data-bs-target="#sync-modal"
            >
                <FontAwesomeIcon icon={faFileImport} />
                Import / Export
            </button>
            <div
                className="modal fade"
                tabIndex={-1}
                id="sync-modal"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header d-flex align-items-center gap-3">
                            <div className="bg-primary-subtle text-bg-primary p-1 py-2 rounded-4">
                                <FontAwesomeIcon icon={faFileImport} size="3x" />
                            </div>
                            <div className="d-flex flex-column">
                                <span className="modal-title">Gegevens synchroniseren en im- of exporteren</span>
                                <small className="text-muted">
                                    Beheer uw patiëntgegevens via importeren, exporteren en API-synchronisatie
                                </small>
                            </div>
                        </div>
                        <div className="modal-body">
                            <h6>API Synchronisatie</h6>
                            <small>Synchroniseer gegevens met externe applications via een API</small>
                            <form className="bg-body-tertiary p-2 rounded-4 mt-2" action={onSynchroniseApi}>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="api-endpoint-input">
                                        API endpoint URL
                                    </label>
                                    <input
                                        className="form-control"
                                        type="url"
                                        id="api-endpoint-input"
                                        name="api-endpoint"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="api-key-input">
                                        API sleutel
                                    </label>
                                    <input className="form-control" type="password" id="api-key-input" name="api-key" />
                                </div>
                                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2">
                                    <FontAwesomeIcon icon={faLink} />
                                    <span>Synchroniseren</span>
                                </button>
                            </form>

                            <hr />

                            <h6>Exporteren</h6>
                            <small>Download alle patiëntgegevens inclusief meetwaarden en gesprekken</small>
                            <button
                                type="button"
                                className="btn btn-primary d-flex align-items-center gap-3 mt-2"
                                onClick={onExportData}
                            >
                                <FontAwesomeIcon icon={faDownload} />
                                <span>Exporteer as JSON</span>
                            </button>

                            <hr />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Terug naar het dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
