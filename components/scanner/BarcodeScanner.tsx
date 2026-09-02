import { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { theme } from '@/constants/theme'

type Props = {
    onScanned: (barcode: string) => void
}

export default function BarcodeScanner({ onScanned }: Props) {
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false)
    const scanLine = new Animated.Value(0)

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLine, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(scanLine, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start()
    }, [])

    if (!permission) return <View />

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>
                    Camera access is needed to scan barcodes
                </Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Allow camera</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={scanned ? undefined : ({ data }) => {
                    setScanned(true)
                    onScanned(data)
                    setTimeout(() => setScanned(false), 3000)
                }}
                barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8'] }}
            />

            {/* Viewfinder par dessus la caméra */}
            <View style={styles.viewfinder}>
                <View style={styles.frame}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                    <Animated.View
                        style={[
                            styles.scanLine,
                            {
                                transform: [{
                                    translateY: scanLine.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, 200],
                                    })
                                }]
                            }
                        ]}
                    />
                </View>
            </View>

            <Text style={styles.hint}>Point your camera at the barcode</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    camera: {
        width: '100%',
        flex: 1,
    },
    viewfinder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    frame: {
        width: 260,
        height: 200,
        backgroundColor: 'transparent',
        position: 'relative',
        overflow: 'hidden',
    },
    corner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: theme.colors.accent,
        borderWidth: 3,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: theme.colors.accent,
        opacity: 0.8,
    },
    hint: {
        color: theme.colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        padding: theme.spacing.lg,
    },
    permissionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: theme.spacing.lg,
    },
    permissionText: {
        color: theme.colors.textMuted,
        fontSize: 15,
        textAlign: 'center',
    },
    button: {
        backgroundColor: theme.colors.accent,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
    },
    buttonText: {
        color: '#000',
        fontWeight: '700',
    },
})