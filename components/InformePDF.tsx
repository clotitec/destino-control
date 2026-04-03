'use client'

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.4/Helvetica-Bold.ttf', fontWeight: 'bold' },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#333' },
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#3b82f6', paddingBottom: 15 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e3a5f' },
  headerSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  headerPeriodo: { fontSize: 9, color: '#3b82f6', marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 },
  section: { marginTop: 14 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 4 },
  paragraph: { fontSize: 10, lineHeight: 1.6, color: '#374151', marginBottom: 4 },
  bullet: { fontSize: 10, lineHeight: 1.6, color: '#374151', marginBottom: 3, paddingLeft: 12 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#9ca3af' },
})

type Props = {
  narrativa: string
  municipio: string
  periodo: string
}

export default function InformePDF({ narrativa, municipio, periodo }: Props) {
  const lines = narrativa.split('\n').filter(l => l.trim())

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerPeriodo}>Informe de turismo digital</Text>
          <Text style={styles.headerTitle}>{municipio}</Text>
          <Text style={styles.headerSubtitle}>{periodo}</Text>
        </View>

        {lines.map((line, i) => {
          const trimmed = line.trim()

          if (trimmed.startsWith('# ')) {
            return <Text key={i} style={styles.sectionTitle}>{trimmed.slice(2)}</Text>
          }
          if (trimmed.startsWith('## ')) {
            return <Text key={i} style={styles.sectionTitle}>{trimmed.slice(3)}</Text>
          }
          if (trimmed.startsWith('### ')) {
            return (
              <View key={i} style={styles.section}>
                <Text style={styles.sectionTitle}>{trimmed.slice(4)}</Text>
              </View>
            )
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const content = trimmed.slice(2).replace(/\*\*(.*?)\*\*/g, '$1')
            return <Text key={i} style={styles.bullet}>• {content}</Text>
          }
          if (trimmed.match(/^\d+\.\s/)) {
            const content = trimmed.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '$1')
            return <Text key={i} style={styles.bullet}>{trimmed.match(/^\d+/)?.[0]}. {content}</Text>
          }
          if (trimmed.startsWith('|')) {
            const content = trimmed.replace(/\*\*(.*?)\*\*/g, '$1')
            return <Text key={i} style={{ ...styles.paragraph, fontFamily: 'Courier' }}>{content}</Text>
          }
          const content = trimmed.replace(/\*\*(.*?)\*\*/g, '$1')
          return <Text key={i} style={styles.paragraph}>{content}</Text>
        })}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Generado por Destino Control — CLOTITEC SLU</Text>
          <Text style={styles.footerText}>{new Date().toLocaleDateString('es-ES')}</Text>
        </View>
      </Page>
    </Document>
  )
}
