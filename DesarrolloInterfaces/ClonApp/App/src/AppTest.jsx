import React from 'react'

export default function AppTest() {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'system-ui, sans-serif'
        }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    React está funcionando ✅
                </h1>
                <p style={{ color: '#666' }}>
                    Si ves esto, el problema está en App.jsx o sus dependencias
                </p>
            </div>
        </div>
    )
}
