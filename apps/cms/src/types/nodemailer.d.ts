declare module 'nodemailer' {
  interface TransportOptions {
    host?: string
    port?: number
    secure?: boolean
    pool?: boolean
    requireTLS?: boolean
    tls?: {
      rejectUnauthorized?: boolean
    }
  }
  
  interface Transporter {
    verify(callback?: (error: Error | null, success?: boolean) => void): Promise<boolean>
    sendMail(mailOptions: any, callback?: any): Promise<any>
  }
  
  export function createTransport(options: TransportOptions): Transporter
  const nodemailer: {
    createTransport: typeof createTransport
  }
  export default nodemailer
}