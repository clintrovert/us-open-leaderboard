import Head from 'next/head'
import Footer from '@components/Footer'
import { useState, useEffect, React, Fragment } from 'react'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { PriorityQueue } from '@datastructures-js/priority-queue';


export default function Home() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    fetch('https://ace-api.usga.org/scoring/v1/leaderboard.json?championship=uso&championship-year=2023')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (isLoading) return <p>Loading...</p>
  if (!data) return <p>No data available</p>

  const normalized = normalize(data)

  return (
    <div className="container">
      <Head>
        <title>Leaderboard Tracker</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <marquee style={{ behavior: "alternate", fontSize: "xx-large" }}>🍆🍆𓂸𓂸🍌🍌🍌🍌╰⋃╯╰⋃╯╭ᑎ╮╭ᑎ╮🍄🍄🍄🍆🍆𓂸𓂸🍌🍌🍌🍌╰⋃╯╰⋃╯╭ᑎ╮╭ᑎ╮🍄🍄🍄</marquee>
      <main>

        <div className="text-center" style={{ paddingBottom: "30px", marginTop: "50px" }}>
          <h1 style={{ color: "black" }}><b>Best Pick ($50 💵)</b></h1>
          <IndividualLeader data={normalized} />
        </div>
        {/* <hr style={{color: "black", border: "5px !important", borderTop: "5px solid rgba(0, 0, 0, 0.1) !important"}}/> */}
        <div className="text-center" style={{ paddingBottom: "30px" }} >
          <h1 style={{ color: "black" }}><b>Leaderboard Average ($150 💵)</b></h1>
          <GroupLeader data={normalized} />
        </div>

        <div className="text-center" >

          <p style={{ color: "black" }}>
            Of the <span style={{ color: "blue" }}><b>156</b></span> player
            field for the tournament, <span style={{ color: "green" }}><b>65</b></span> players made
            the cut. <span style={{ color: "red" }}><b>91</b></span> players missed the cut (or withdrew), meaning
            the average player who missed the cut finished <span style={{ color: "black" }}><b>110.5</b></span>.
          </p>
          <p style={{ color: "black" }}>
            For those who had a player who missed the cut, the player's final leaderboard position
            is taken as this value to calculate the average.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  )
}

function normalize(data) {
  const clint = { name: 'Clint', picks: [{ firstName: 'Viktor', lastName: 'Hovland' }, { firstName: 'Brooks', lastName: 'Koepka' }, { firstName: 'Max', lastName: 'Homa' }, { firstName: 'Dustin', lastName: 'Johnson' }] }
  const shane = { name: 'Shane', picks: [{ firstName: 'Scottie', lastName: 'Scheffler' }, { firstName: 'Collin', lastName: 'Morikawa' }, { firstName: 'Cameron', lastName: 'Smith' }, { firstName: 'Sungjae', lastName: 'Im' }] }
  const craig = { name: 'Craig', picks: [{ firstName: 'Rory', lastName: 'McIlroy' }, { firstName: 'Xander', lastName: 'Schauffele' }, { firstName: 'Cameron', lastName: 'Young' }, { firstName: 'Hideki', lastName: 'Matsuyama' }] }
  const matt = { name: 'Matt', picks: [{ firstName: 'Jon', lastName: 'Rahm' }, { firstName: 'Patrick', lastName: 'Cantlay' }, { firstName: 'Jordan', lastName: 'Spieth' }, { firstName: 'Tony', lastName: 'Finau' }] }

  const persons = [clint, shane, craig, matt]
  let normalized = []

  persons.forEach(person => {
    let leaderboardPositions = 0
    let response = {}
    response.players = []
    person.picks.forEach(pick => {
      data.standings.forEach(standing => {
        let player = standing.player
        let respPlayer = {}
        if (pick.firstName == player.firstName && pick.lastName == player.lastName) {
          respPlayer.name = player.firstName + " " + player.lastName
          let standingDisp = standing.position.displayValue
          respPlayer.position = standingDisp
          let position = 100.5
          if (standingDisp != 'MC') {
            if (standingDisp.includes('T')) {
              position = parseInt(standingDisp.replace('T', ''))
            } else {
              position = parseInt(standingDisp)
            }
          }
          respPlayer.posint = position
          leaderboardPositions += position
          response.players.push(respPlayer)
        }
      })
      const avg = leaderboardPositions / 4
      response.average = avg
    })
    response.person = person.name
    normalized.push(response)
  })

  return { guys: normalized }
}

function IndividualLeader({ data }) {
  const best = getTopLeader(data)
  let bestGolfer = " has the lowest scoring golfer with "
  let inPosition = " who is currently "

  // best.guys = ['Shane', 'Clint', 'Craig']
  // best.players = ['Rory McIlory', 'Patrick Cantlay', 'Collin Morikawa']
  let guy = best.guys[0]
  if (best.guys.length > 1) {
    guy = best.guys.join(', ').replace(/,(?!.*,)/gmi, ' and');
    bestGolfer = " have the lowest scoring golfers with "
    inPosition = " who are currently "
  }

  if (best.guys.length == 1 && best.players.length > 1) {
    bestGolfer = " has the lowest scoring golfers with "
  }

  let player = best.players[0]
  if (best.players.length > 1) {
    player = best.players.join(', ').replace(/,(?!.*,)/gmi, ' and');
    inPosition = " who are currently "
  }

  if (best.players.length == 1 && best.guys.legnth == 1) {
    bestGolfer = " has the lowest scoring golfer with"
  }

  return <h2 className="text-center" style={{ position: "centered" }}><span style={{ color: "black" }}><b>{guy}</b></span> {bestGolfer} <span style={{ color: "green" }}><b>{player}</b></span> {inPosition} <span style={{ color: "green" }}><b>{best.position}</b></span> on the leaderboard</h2>
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
      displayPosition = "last"
      color = "red"
    }
    total.push(<h2 key={position + last} className="text-center" style={{ position: "centered" }}><span style={{ color: "black" }}><b>{curr.person}</b></span> is in <span style={{ color: color }}><b>{displayPosition}</b></span> with an average leaderboard position of <span style={{ color: color }}><b>{curr.average}</b></span></h2>)
    position += 1
  }

  return total
}

function getTopLeader(data) {
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
          }
          bestPlayers.push(player.name)
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
