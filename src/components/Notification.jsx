import Toast from 'react-bootstrap/Toast';
import { useState } from 'react';
import useList from '../helper/list'

export default function ({ message }) {
    const [show, setShow] = useState(true);

    return (<Toast onClose={() => setShow(false)} show={show} delay={3000} autohide>
        <Toast.Header>
            <strong className="me-auto">Alert!</strong>
            <small></small>
        </Toast.Header>
        <Toast.Body>{ message }</Toast.Body>
    </Toast>);
}