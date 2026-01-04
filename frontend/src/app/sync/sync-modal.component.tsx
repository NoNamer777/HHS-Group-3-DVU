import { faFileImport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './sync-modal.component.css';

export default function SyncModalComponent() {
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
                                <FontAwesomeIcon
                                    icon={faFileImport}
                                    size="3x"
                                />
                            </div>
                            <div className="d-flex flex-column">
                                <span className="modal-title">
                                    Gegevens synchroniseren en im- of exporteren
                                </span>
                                <small className="text-muted">
                                    Beheer uw patiëntgegevens via importeren,
                                    exporteren en API-synchronisatie
                                </small>
                            </div>
                        </div>
                        <div className="modal-body"></div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Terug naar het dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
