import React, { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { FiPrinter, FiX, FiShield, FiCheckCircle } from 'react-icons/fi'

const PartnerIDCard = ({ profile, partner, onClose }) => {
  const cardRef = useRef(null)

  const handlePrint = async () => {
    // Get QR code as data URL
    const qrElement = cardRef.current.querySelector('svg')
    let qrDataUrl = ''
    
    if (qrElement) {
      const svgData = new XMLSerializer().serializeToString(qrElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const img = new Image()
      await new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          qrDataUrl = canvas.toDataURL('image/png')
          URL.revokeObjectURL(url)
          resolve()
        }
        img.src = url
      })
    }

    const printWindow = window.open('', '_blank')
    const cardContent = cardRef.current.innerHTML.replace(
      /<svg[\s\S]*?<\/svg>/,
      `<img src="${qrDataUrl}" style="width: 80px; height: 80px; display: block;" />`
    )
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Partner ID Card - Nexo</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                justify-content: center;
                align-items: flex-start;
                min-height: 100vh;
                padding-top: 30px;
              }
              .id-card {
                transform: scale(1.8);
                transform-origin: top center;
                margin: 0 auto;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background: #f5f5f5;
            }
            .id-card {
              width: 85.6mm;
              height: 53.98mm;
              background: linear-gradient(135deg, #214A73 0%, #2d5a8a 100%);
              border-radius: 12px;
              padding: 10px;
              box-shadow: 0 10px 40px rgba(33, 74, 115, 0.4);
              position: relative;
              overflow: hidden;
            }
            .id-card::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
            }
            .id-card::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 3px;
              background: linear-gradient(90deg, #214A73 0%, #2d5a8a 50%, #214A73 100%);
            }
            .id-card-content {
              position: relative;
              z-index: 1;
              display: flex;
              height: 100%;
              background: white;
              border-radius: 8px;
              padding: 8px;
              box-shadow: inset 0 0 20px rgba(33, 74, 115, 0.1);
            }
            .id-card-left {
              flex: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding-right: 8px;
            }
            .id-card-header {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 6px;
              padding-bottom: 6px;
              border-bottom: 2px solid #214A73;
            }
            .id-card-logo {
              width: 28px;
              height: 28px;
              background: linear-gradient(135deg, #214A73 0%, #2d5a8a 100%);
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 800;
              font-size: 11px;
              letter-spacing: 0.5px;
            }
            .id-card-title {
              font-size: 9px;
              font-weight: 800;
              color: #214A73;
              text-transform: uppercase;
              letter-spacing: 1.2px;
            }
            .id-card-photo {
              width: 65px;
              height: 65px;
              border-radius: 8px;
              border: 3px solid #214A73;
              object-fit: cover;
              margin: 6px 0;
              box-shadow: 0 2px 8px rgba(33, 74, 115, 0.2);
            }
            .id-card-name {
              font-size: 15px;
              font-weight: 800;
              color: #1a202c;
              margin-bottom: 4px;
              letter-spacing: 0.3px;
            }
            .id-card-details {
              font-size: 8.5px;
              color: #4a5568;
              line-height: 1.5;
            }
            .id-card-detail-item {
              margin-bottom: 3px;
              display: flex;
              align-items: center;
              gap: 4px;
            }
            .id-card-detail-item strong {
              color: #214A73;
              font-weight: 700;
              min-width: 45px;
            }
            .id-card-right {
              width: 85px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 6px;
              border-left: 2px dashed #e2e8f0;
              padding-left: 8px;
            }
            .id-card-qr {
              width: 75px;
              height: 75px;
              padding: 5px;
              background: white;
              border-radius: 6px;
              border: 2px solid #214A73;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 8px rgba(33, 74, 115, 0.15);
            }
            .id-card-verified {
              font-size: 7px;
              color: #48bb78;
              text-align: center;
              font-weight: 700;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 3px;
              background: #f0fdf4;
              padding: 3px 6px;
              border-radius: 4px;
              border: 1px solid #86efac;
            }
            .id-card-id {
              font-size: 7.5px;
              color: #214A73;
              text-align: center;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            .id-card-footer {
              font-size: 6.5px;
              color: #718096;
              text-align: center;
              margin-top: 2px;
            }
          </style>
        </head>
        <body>
          ${cardContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const partnerIdValue = profile?.id || partner?._id || 'unknown'
  const verificationUrl = `${window.location.origin}/verify/partner/${partnerIdValue}`
  const partnerId = partnerIdValue !== 'unknown' ? partnerIdValue.toString().slice(-8).toUpperCase() : 'N/A'
  const partnerName = profile?.name || partner?.profile?.name || 'Partner Name'
  const partnerPhone = profile?.phone || partner?.phone || 'N/A'
  const partnerCity = profile?.city || partner?.profile?.city || 'N/A'
  const partnerEmail = profile?.email || partner?.profile?.email || 'N/A'
  const profilePicture = profile?.profilePicture || partner?.profilePicture || null
  const profileImageUrl = profilePicture 
    ? (profilePicture.startsWith('http') ? profilePicture : `http://localhost:5173/uploads/profiles/${profilePicture}`)
    : null
  const isVerified = profile?.kyc?.status === 'approved' || profile?.kyc?.status === 'verified'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-1">Partner ID Card</h2>
            <p className="text-sm text-slate-600">Professional identification card with QR verification</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* ID Card Preview */}
        <div className="flex justify-center mb-6 bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-xl">
          <div 
            ref={cardRef} 
            className="id-card"
            style={{
              width: '85.6mm',
              height: '53.98mm',
              background: 'linear-gradient(135deg, #214A73 0%, #2d5a8a 100%)',
              borderRadius: '12px',
              padding: '10px',
              boxShadow: '0 10px 40px rgba(33, 74, 115, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Decorative background pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
              pointerEvents: 'none'
            }} />
            
            <div className="id-card-content" style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              height: '100%',
              background: 'white',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: 'inset 0 0 20px rgba(33, 74, 115, 0.1)'
            }}>
              <div className="id-card-left" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                paddingRight: '8px'
              }}>
                <div>
                  <div className="id-card-header" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px',
                    paddingBottom: '6px',
                    borderBottom: '2px solid #214A73'
                  }}>
                    <div className="id-card-logo" style={{
                      width: '28px',
                      height: '28px',
                      background: 'linear-gradient(135deg, #214A73 0%, #2d5a8a 100%)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '11px',
                      letterSpacing: '0.5px'
                    }}>
                      NEXO
                    </div>
                    <div className="id-card-title" style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      color: '#214A73',
                      textTransform: 'uppercase',
                      letterSpacing: '1.2px'
                    }}>Verified Partner</div>
                  </div>
                  
                  {profileImageUrl ? (
                    <img 
                      src={profileImageUrl} 
                      alt={partnerName}
                      className="id-card-photo"
                      style={{
                        width: '65px',
                        height: '65px',
                        borderRadius: '8px',
                        border: '3px solid #214A73',
                        objectFit: 'cover',
                        margin: '6px 0',
                        boxShadow: '0 2px 8px rgba(33, 74, 115, 0.2)'
                      }}
                    />
                  ) : (
                    <div className="id-card-photo" style={{
                      width: '65px',
                      height: '65px',
                      borderRadius: '8px',
                      border: '3px solid #214A73',
                      background: 'linear-gradient(135deg, #214A73 0%, #2d5a8a 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '24px',
                      margin: '6px 0',
                      boxShadow: '0 2px 8px rgba(33, 74, 115, 0.2)'
                    }}>
                      {partnerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="id-card-name" style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#1a202c',
                    marginBottom: '4px',
                    letterSpacing: '0.3px'
                  }}>{partnerName}</div>
                  
                  <div className="id-card-details" style={{
                    fontSize: '8.5px',
                    color: '#4a5568',
                    lineHeight: 1.5
                  }}>
                    <div className="id-card-detail-item" style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ color: '#214A73', fontWeight: 700, minWidth: '45px' }}>ID:</strong>
                      <span>{partnerId}</span>
                    </div>
                    <div className="id-card-detail-item" style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ color: '#214A73', fontWeight: 700, minWidth: '45px' }}>Phone:</strong>
                      <span>{partnerPhone}</span>
                    </div>
                    <div className="id-card-detail-item" style={{ marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong style={{ color: '#214A73', fontWeight: 700, minWidth: '45px' }}>City:</strong>
                      <span>{partnerCity}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="id-card-right" style={{
                width: '85px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderLeft: '2px dashed #e2e8f0',
                paddingLeft: '8px'
              }}>
                <div className="id-card-qr" style={{
                  width: '75px',
                  height: '75px',
                  padding: '5px',
                  background: 'white',
                  borderRadius: '6px',
                  border: '2px solid #214A73',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(33, 74, 115, 0.15)'
                }}>
                  <QRCodeSVG
                    value={verificationUrl}
                    size={65}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                {isVerified && (
                  <div className="id-card-verified" style={{
                    fontSize: '7px',
                    color: '#48bb78',
                    textAlign: 'center',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    background: '#f0fdf4',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    border: '1px solid #86efac'
                  }}>
                    <FiCheckCircle style={{ fontSize: '8px' }} />
                    Verified
                  </div>
                )}
                <div className="id-card-id" style={{
                  fontSize: '7.5px',
                  color: '#214A73',
                  textAlign: 'center',
                  fontWeight: 700,
                  letterSpacing: '0.5px'
                }}>
                  Scan to Verify
                </div>
                <div className="id-card-footer" style={{
                  fontSize: '6.5px',
                  color: '#718096',
                  textAlign: 'center',
                  marginTop: '2px'
                }}>
                  nexo.works
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Actions */}
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition flex items-center gap-2 shadow-lg"
          >
            <FiPrinter /> Print ID Card
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition flex items-center gap-2"
          >
            <FiX /> Close
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <FiShield className="text-primary text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-primary mb-1">Verification Features</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>• QR code links to public verification page</li>
                <li>• Anyone can scan to verify your partner status</li>
                <li>• Shows your verification status and credentials</li>
                <li>• Professional ID card format for printing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PartnerIDCard
