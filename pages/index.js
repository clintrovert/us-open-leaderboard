import Head from 'next/head'
import Footer from '@components/Footer'
import {React, useEffect, useState} from 'react'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import {PriorityQueue} from '@datastructures-js/priority-queue';


export default function Home() {
  const [data, setData] = useState(null)
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setLoading(true)
    fetch('https://www.masters.com/en_US/scores/feeds/2024/scores.json')
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        setData(data.data)
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
      <main>

        <div className="text-center" style={{ paddingBottom: "30px", marginTop: "50px" }}>
          <h1 style={{ color: "black" }}><b>Best Pick ($100 💵)</b></h1>
          <IndividualLeader data={normalized} />
        </div>
        {/* <hr style={{color: "black", border: "5px !important", borderTop: "5px solid rgba(0, 0, 0, 0.1) !important"}}/> */}
        <div className="text-center" style={{ paddingBottom: "30px" }} >
          <h1 style={{ color: "black" }}><b>Leaderboard Average ($100 💵)</b></h1>
          <GroupLeader data={normalized} />
        </div>

        <div className="text-center" >
          <p style={{ color: "black" }}>
            Of the <span style={{ color: "blue" }}><b>88</b></span> player
            field for the tournament, <span style={{ color: "green" }}><b>59</b></span> players made
            the cut. <span style={{ color: "red" }}><b>29</b></span> players missed the cut (or withdrew), meaning
            the average player who missed the cut finished <span style={{ color: "black" }}><b>73</b></span>.
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
  const clint = { name: 'Clint', picks: [{ first_name: 'Jon', last_name: 'Rahm' }, { first_name: 'Jordan', last_name: 'Spieth' }, { first_name: 'Matt', last_name: 'Fitzpatrick' }, { first_name: 'Bryson', last_name: 'DeChambeau' }, { first_name: 'Cameron', last_name: 'Young' }, { first_name: 'Dustin', last_name: 'Johnson' }, { first_name: 'Patrick', last_name: 'Reed' }, { first_name: 'Min Woo', last_name: 'Lee' }] }
  const shane = { name: 'Shane', picks: [{ first_name: 'Brooks', last_name: 'Koepka' }, { first_name: 'Wyndham', last_name: 'Clark' }, { first_name: 'Hideki', last_name: 'Matsuyama' }, { first_name: 'Joaquín', last_name: 'Niemann' }, { first_name: 'Sahith', last_name: 'Theegala' }, { first_name: 'Sam', last_name: 'Burns' }, { first_name: 'Justin', last_name: 'Thomas' }, { first_name: 'Akshay', last_name: 'Bhatia' }] }
  const craig = { name: 'Craig', picks: [{ first_name: 'Rory', last_name: 'McIlroy' }, { first_name: 'Viktor', last_name: 'Hovland' }, { first_name: 'Will', last_name: 'Zalatoris' }, { first_name: 'Patrick', last_name: 'Cantlay' }, { first_name: 'Ludvig', last_name: 'Åberg' }, { first_name: 'Max', last_name: 'Home' }, { first_name: 'Brian', last_name: 'Harman' }, { first_name: 'Tiger', last_name: 'Woods' }] }
  const matt = { name: 'Matt', picks: [{ first_name: 'Scottie', last_name: 'Scheffler' }, { first_name: 'Xander', last_name: 'Schauffele' }, { first_name: 'Cameron', last_name: 'Smith' }, { first_name: 'Collin', last_name: 'Morikawa' }, { first_name: 'Tony', last_name: 'Finau' }, { first_name: 'Shane', last_name: 'Lowry' }, { first_name: 'Tommy', last_name: 'Fleetwood' }, { first_name: 'Phil', last_name: 'Mickelson' }] }

  const persons = [clint, shane, craig, matt]
  let normalized = []

  persons.forEach(person => {
    let leaderboardPositions = 0
    let response = {}
    response.players = []
    person.picks.forEach(pick => {
      const positions = []
      data.player.forEach(player => {
        let respPlayer = {}
        if (pick.first_name === player.first_name && pick.last_name === player.last_name) {
          respPlayer.name = player.first_name + " " + player.last_name
          let standingDisp = player.pos
          respPlayer.position = standingDisp
          let position = 73
          if (standingDisp !== '') {
            if (standingDisp.includes('T')) {
              position = parseInt(standingDisp.replace('T', ''))
            } else {
              position = parseInt(standingDisp)
            }
          }
          respPlayer.posint = position
          positions.push(position)
          response.players.push(respPlayer)
        }
      })
    })

    const positions = response.players.sort((a, b) => a.posint - b.posint);
    const sum = positions.slice(0, 6).reduce((acc, curr) => acc + curr.posint, 0);
    response.average = truncateToTwoDecimals(sum / 6)

    response.person = person.name
    normalized.push(response)
  })

  return { guys: normalized }
}

function truncateToTwoDecimals(number) {
  if (Number.isInteger(number)) {
    return number;
  } else {
    return Number(number.toFixed(2));
  }
}

function IndividualLeader({ data }) {
  const best = getTopLeader(data)
  let bestGolfer = " has won with the best pick with "
  let inPosition = " who is finished "

  let guy = best.guys[0]
  if (best.guys.length > 1) {
    guy = best.guys.join(', ').replace(/,(?!.*,)/gmi, ' and');
    bestGolfer = " have the lowest scoring golfers with "
    inPosition = " who are currently "
  }

  if (best.guys.length === 1 && best.players.length > 1) {
    bestGolfer = " has the lowest scoring golfers with "
  }

  let player = best.players[0]
  if (best.players.length > 1) {
    player = best.players.join(', ').replace(/,(?!.*,)/gmi, ' and');
    inPosition = " who are currently "
  }

  if (best.players.length === 1 && best.guys.legnth === 1) {
    bestGolfer = " has the lowest scoring golfer with"
  }

  return <h2 className="text-center" style={{ position: "centered" }}><span style={{ color: "black" }}><b>{guy}</b></span> {bestGolfer} <span style={{ color: "green" }}><b>{player}</b></span> {inPosition} <span style={{ color: "green" }}><b>{best.position}</b></span>nd on the leaderboard</h2>
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
    total.push(<h2 key={position + last} className="text-center" style={{ position: "centered" }}><span style={{ color: "black" }}><b>{curr.person}</b></span> finished in <span style={{ color: color }}><b>{displayPosition}</b></span> with an average leaderboard position of <span style={{ color: color }}><b>{curr.average}</b></span></h2>)
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
        if (player.posint === lowest) {
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
