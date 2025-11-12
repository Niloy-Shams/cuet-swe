import Button from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { ScreenHeader } from '@/components/ui/screen-header'
import { Text } from '@/components/ui/text'
import React from 'react'
import { View } from 'react-native'

export default function CoursesScreen() {
    return (
        <Container>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Courses</Text>
                <Button href='/(teacher)/(tabs)/home'>
                    Home
                </Button>
            </View>
        </Container>
    )
}