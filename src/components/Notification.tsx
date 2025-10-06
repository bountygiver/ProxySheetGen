import Toast from 'react-bootstrap/Toast';
import { useState } from 'react';

export default function ({ title, message, children, delay }: { title?: string, message?: string, children?: React.ReactElement | React.ReactElement[], delay?: number }) {
    const [show, setShow] = useState(true);

    return (<Toast onClose={() => setShow(false)} show={show} delay={delay || 3000} autohide>
        <Toast.Header>
            <strong className="me-auto">{title || "Alert!"}</strong>
            <small>{children}</small>
        </Toast.Header>
        <Toast.Body>{message}</Toast.Body>
    </Toast>);
}