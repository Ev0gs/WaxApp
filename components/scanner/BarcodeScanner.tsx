import { useState, useEffect, useRef } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { theme } from '@/constants/theme'

const { width } = Dimensions.get('window')
const FRAME_WIDTH = width * 0.75
const FRAME_HEIGHT = FRAME_WIDTH * 0.6

type Props = {
    onScanned: (barcode: string) => void
    availableHeight?: number
}

export default function BarcodeScanner({ onScanned, availableHeight = 0 }: Props) {
    const [permission, requestPermission] = useCameraPermissions()
    const [scanned, setScanned] = useState(false)
    const scanLine = useRef(new Animated.Value(0)).current

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
        <View style={styles.wrapper}>
            {/* Zone caméra */}
            <View style={[styles.container, { marginBottom: 0 }]}>
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

                {/* Overlay */}
                <View style={styles.overlay}>
                    <View style={styles.overlayTop} />
                    <View style={styles.overlayMiddleRow}>
                        <View style={styles.overlaySide} />
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
                                                outputRange: [0, FRAME_HEIGHT - 2],
                                            })
                                        }]
                                    }
                                ]}
                            />
                        </View>
                        <View style={styles.overlaySide} />
                    </View>
                    <View style={styles.overlayBottom} />
                </View>
            </View>

            {/* Hint text sous la caméra, au dessus de la navbar */}
            <View style={[styles.hintContainer, { paddingBottom: availableHeight }]}>
                <Text style={styles.hint}>Point your camera at the barcode</Text>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        flexDirection: 'column',
    },
    container: {
        flex: 1,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        margin: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        backgroundColor: '#000',
    },
    hintContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
    },
    hint: {
        color: theme.colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
// Supprime l'ancien overlayBottom avec le hint dedans
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        flexDirection: 'column',
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    overlayMiddleRow: {
        height: FRAME_HEIGHT,
        flexDirection: 'row',
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.65)',
    },
    frame: {
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
        backgroundColor: 'transparent',
    },
    corner: {
        position: 'absolute',
        width: 28,
        height: 28,
        borderColor: theme.colors.accent,
        borderWidth: 3,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        borderTopLeftRadius: 8,
    },
    topRight: {
        top: 0,
        right: 0,
        borderLeftWidth: 0,
        borderBottomWidth: 0,
        borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderRightWidth: 0,
        borderTopWidth: 0,
        borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderLeftWidth: 0,
        borderTopWidth: 0,
        borderBottomRightRadius: 8,
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: theme.colors.accent,
        shadowColor: theme.colors.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 4,
    },
    permissionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
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