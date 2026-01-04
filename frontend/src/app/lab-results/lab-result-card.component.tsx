import type { LabResult } from '@/models';

interface LabResultCardComponentProps {
    labResult: LabResult;
}

export default function LabResultCardComponent(
    props: LabResultCardComponentProps,
) {
    const { labResult } = props;

    return (
        <div className="card w-100 text-bg-light rounded-4 mb-2">
            <div className="card-body">
                <div className="d-flex justify-content-between">
                    <h6 className="card-title">{labResult.type}</h6>
                    <span
                        className={
                            labResult.minValue && labResult.maxValue
                                ? `${labResult.value > labResult.maxValue || labResult.value < labResult.minValue ? 'text-danger fw-bold' : 'text-success fw-bold'}`
                                : ''
                        }
                    >
                        {labResult.value} {labResult.unit}
                    </span>
                </div>
                <small className="text-muted d-flex align-items-center justify-content-between">
                    <span>
                        {new Date(labResult.timestamp).toLocaleDateString()}
                    </span>
                    {labResult.minValue && labResult.maxValue && (
                        <span>
                            Normaal: {labResult.minValue} - {labResult.maxValue}
                        </span>
                    )}
                </small>
            </div>
        </div>
    );
}
