import React from 'react'
import {Text} from '@/components/ui/text'
import Button from '@/components/ui/button'
import { Container } from '@/components/ui/container'

export default function StudentHomeTab() {
  return (
    <Container style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant='title'>Student Home</Text>
      <Button>
        My Courses
      </Button>
    </Container>
  )
}