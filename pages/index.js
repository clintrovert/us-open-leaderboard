import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'
import { useState, useEffect, React, Fragment } from 'react'
import ListGroup from 'react-bootstrap/ListGroup';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Row from 'react-bootstrap/Row';
import {PriorityQueue} from '@datastructures-js/priority-queue';


export default function Home() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('https://us-central1-northern-center-387310.cloudfunctions.net/function-1')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No data available</p>
  const best = getTopLeader(data)

  return (
    <div className="container">
      <Head>
        <title>Leaderboard Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Row className="text-center" style={{marginBottom: "30px"}}>
          <h1>Best Pick ($50 💵)</h1>
          <IndividualLeader data={data} />
        </Row>
        <Row  className="text-center"  style={{marginBottom: "30px"}} >
          <h1>Leaderboard Average ($150 💵)</h1>
          <GroupLeader data={data} />
        </Row>

        <Row  className="text-center" >
          <p>For those who had a player who missed the cut, the player's final leaderboard position is taken as <b>111</b> to calculate the average. </p>
          <p>This is due to the fact of the <span style={{color: "blue"}}><b>156</b></span> player field for the tournament, <span style={{color: "green"}}><b>65</b></span> players made the cut. <span style={{color: "red"}}><b>91</b></span> players missed the cut, meaning the average player who missed the cut finished <b>111</b>.</p>
        </Row>

      </main>

      <Footer />
    </div>
  )
}

function IndividualLeader({ data }) {
  const best = getTopLeader(data)
  let bestGolfer = " currently has the lowest scoring golfer with "
  let inPosition = " who is in "

  // best.guys = ['Shane', 'Clint', 'Craig']
  // best.players = ['Rory McIlory', 'Patrick Cantlay', 'Collin Morikawa']
  let guy = best.guys[0]
  if (best.guys.length > 1) {
    guy = best.guys.join(', ').replace(/,(?!.*,)/gmi, ' and');
    bestGolfer = " currently have the lowest scoring golfers with "
    inPosition = " who are in "
  }

  let player = best.players[0]
  if (best.players.length > 1) {
    player = best.players.join(', ').replace(/,(?!.*,)/gmi, ' and');
    inPosition = " who are in "
  }

  if (best.players.length == 1 && best.guys.legnth == 1) {
    bestGolfer = " has the lowest scoring golfer with"
  }

  return <h2 className="text-center" style={{ position: "centeblue" }}><span style={{ color: "blue" }}><b>{guy}</b></span> {bestGolfer} <span style={{ color: "blue" }}><b>{player}</b></span> {inPosition} <span style={{ color: "blue" }}><b>{best.position}</b></span></h2>
}

function GroupLeader({ data }) {
  const guys = data.guys
  const pq = PriorityQueue.fromArray(guys, (a, b) => a.average - b.average);
  let position = 1
  let last = 1000
  let total = []

  for (const curr of pq) {
    let displayPosition = "first"
    let color = "green"
    if (position == 2) {
      displayPosition = "second"
      color = "blue"
    } 
    if (position == 3) {
      displayPosition = "third"
      color = "orange"
    }
    if (position == 4) {
      displayPosition = "fourth"
      color = "red"
    }
    total.push(<h2 key={position+last} className="text-center" style={{ position: "centeblue" }}><span style={{ color: "blue" }}><b>{curr.person}</b></span> is in <span style={{ color: color }}><b>{displayPosition}</b></span> with an average leaderboard position of <span style={{ color: color }}><b>{curr.average}</b></span></h2>)
    position += 1
  }

  return total
}

function getTopLeader(data) {
  // console.log(data)
  let lowest = 1000;
  let bestPlayers = [];
  let bestGuys = [];
  let bestPosition = "";

  try {
    data.guys.forEach(guy => {
      guy.players.forEach(player => {
        if (player.posint == lowest) {
          if (!bestGuys.includes(guy.person)) {
            bestGuys.push(guy.person)
            bestPlayers.push(player.name)
          }
        } else if (player.posint < lowest) {
          lowest = player.posint
          bestPosition = player.position
          bestPlayers = []
          bestGuys = []
          bestPlayers.push(player.name)
          bestGuys.push(guy.person)
        }
      })
    });

    return { position: bestPosition, players: bestPlayers, guys: bestGuys }
  } catch (error) {
    console.log(error);
  }
}