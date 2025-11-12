import { Container } from '@/components/ui/container'
import { useTheme } from '@/hooks/use-theme'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator } from 'react-native'
import { Text } from '@/components/ui/text'

export default function LoadingScreen() {
    const { colors } = useTheme()
    
    return (
        <Container style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <Ionicons name="school" size={64} color={colors.primary} />
            <Text style={{
                marginTop: 16,
                fontSize: 16,
                color: colors.mutedForeground,
                fontWeight: '500'
            }}>
                Loading CUET Portal...
            </Text>
            <ActivityIndicator
                size="large"
                color={colors.primary}
                style={{ marginTop: 20 }}
            />
        </Container>
    )
}