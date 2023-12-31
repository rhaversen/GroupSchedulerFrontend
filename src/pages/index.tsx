import Head from 'next/head'
import cookie from 'cookie'
import { type GetServerSideProps, type GetServerSidePropsContext } from 'next'
import React from 'react'

function Index (): JSX.Element {
    return (
        <div>
            <Head>
                <title>Rain Date</title>
                <link rel="canonical" href="https://www.raindate.net"/>
                <meta
                    name="description"
                    content="Your Event Planning App is a one-stop shop for all your event planning needs. With our app, you can view all your upcoming events, create and manage calendars, and see when other users are available. Plus, our event pages let you see more info about events, such as descriptions, dates, and locations."
                />
                <meta
                    name="keywords"
                    content="event planning, calendar, events, dashboard, availability, group scheduler, friends, holiday, vacation, plans, rally, reindate"
                />
            </Head>
            {/* Add some meaningful content here if needed, such as a brief overview of your website or a call to action. */}
            {/* Use internal links to link to other pages on your website. */}
            {/* Optimize your images for SEO. */}
        </div>
    )
}

export default Index

export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
    const parsedCookies = cookie.parse(context.req.headers.cookie ?? '')
    const isLoggedIn = 'connect.sid' in parsedCookies

    // Redirect based on the login status
    if (isLoggedIn) {
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false // Temporary redirect
            }
        }
    } else {
        return {
            redirect: {
                destination: '/landing',
                permanent: false
            }
        }
    }
}
