import React, { useMemo, useState, useEffect } from 'react'
import { Grid, Row } from 'react-native-easy-grid'
import { getBoard } from '../../utilities/FileUtilities'
import _ from 'lodash'
import { Card, CardItem, Text, Body, Thumbnail, Button, Icon } from 'native-base'
import { RUBIK_BOLD } from '../../constants/constants'
import { Image, StyleSheet, TouchableOpacity, StatusBar, View, Dimensions } from 'react-native'
import * as Speech from 'expo-speech'
import { SvgUri } from 'react-native-svg'
import ellipsize from 'ellipsize'
import { uuidv4 } from '../../utilities/DataUtilities'

const defaultBoard = {
  grid: { order: [] }
}

const DEFAULT_BOARD_NAME = 'board_1_235'

const Board = () => {
  let [board, setBoard] = useState(defaultBoard)
  let [boardName, setBoardName] = useState(DEFAULT_BOARD_NAME)
  let [speechItems, setSpeechItems] = useState([])

  const setupBoard = async () => {
    const newBoard = await getBoard(boardName)
    setBoard(newBoard)
  }

  useEffect(() => {
    setupBoard(boardName)
  }, [boardName])

  const speechTags = speechItems.map((boardItem) => {
    return (
      <View key={uuidv4()}>
        {boardItem.imageUrl &&
          (boardItem.imageUrl.endsWith('svg') ? (
            <SvgUri style={styles.image} width="80%" height="80%" uri={boardItem.imageUrl} />
          ) : (
            <Thumbnail small source={{ uri: boardItem.imageUrl }} />
          ))}
        <Text>{ellipsize(boardItem.label, 8)}</Text>
      </View>
    )
  })

  const buttons = useMemo(() => {
    let rows = []
    const cardHeight = Dimensions.get('window').height / board.grid.rows - 30
    const cardWidth = Dimensions.get('window').width / board.grid.columns - 5

    board.grid.order.forEach((grid) => {
      let row = grid.map((item, innerIndex) => {
        if (!item) return
        let boardItem = _.find(board.buttons, { id: item })
        let image = _.find(board.images, { id: boardItem.image_id })

        return (
          <Card
            key={innerIndex}
            style={{ ...styles.card, height: cardHeight, width: cardWidth, maxHeight: cardHeight }}
          >
            <TouchableOpacity
              onPress={() => {
                if (boardItem.load_board) {
                  setBoardName(`board_${boardItem.load_board.id}`)
                } else {
                  const newItem = { ...boardItem, id: speechItems.length + 1, imageUrl: image.url }
                  let itemsCopy = [...speechItems]
                  itemsCopy.push(newItem)
                  setSpeechItems(itemsCopy)
                  Speech.speak(boardItem.label)
                  if (boardName !== DEFAULT_BOARD_NAME) {
                    setBoardName(defaultBoard)
                  }
                }
              }}
            >
              <CardItem style={styles.cardTitle}>
                <Text style={styles.cardTitle}>{boardItem.label}</Text>
              </CardItem>
              {image && (
                <CardItem style={styles.cardBody}>
                  <Body>
                    {image.url.endsWith('svg') ? (
                      <SvgUri style={styles.image} width="80%" height="80%" uri={image.url} />
                    ) : (
                      <Image
                        style={styles.image}
                        source={{
                          uri: image.url
                        }}
                      />
                    )}
                  </Body>
                </CardItem>
              )}
            </TouchableOpacity>
          </Card>
        )
      })
      rows.push(<Row style={styles.row}>{row}</Row>)
    })
    return rows
  }, [board, speechItems])
  return (
    <Grid>
      <StatusBar hidden />
      <Row style={{ color: 'black', height: 50 }}>
        {speechTags}
        <Button
          danger
          rounded
          style={{
            marginLeft: 'auto',
            marginRight: 10,
            marginTop: 5
          }}
          onPress={() => {
            setSpeechItems([])
          }}
        >
          <Icon name={'close'} />
        </Button>
      </Row>
      {buttons}
    </Grid>
  )
}

export default Board
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#3D3E41'
  },
  title: {
    color: 'white',
    fontFamily: RUBIK_BOLD
  },
  cardTitle: {
    color: 'white',
    fontWeight: '500',
    fontFamily: RUBIK_BOLD,
    backgroundColor: '#3D3E41'
  },
  card: {
    backgroundColor: '#38383B'
  },
  cardBody: {
    backgroundColor: '#38383B'
  },
  background: {
    backgroundColor: '#2B2D2F'
  },
  center: {
    justifyContent: 'center'
  },
  image: {
    alignSelf: 'center',
    width: '80%',
    height: '80%',
    aspectRatio: 1.1
  },
  row: {
    marginBottom: 10
  }
})
