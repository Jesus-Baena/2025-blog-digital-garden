---
title: Are my emails reaching people? A five-minute check for independent consultants
type: post
date: 2026-10-01
tags:
  - stack
  - tutorial
description: If you send proposals from your own domain, you are trusting a chain of technical checks you have probably never looked at. Gmail and Outlook will show you the verdict in five minutes, no IT team required.
draft: false
---
In September I moved my business email to a new account. Same domain, same address, different provider underneath. It was a routine change, but it made me ask a question I had never checked properly: when I send a proposal to a UN agency or an INGO from `me@mydomain`, does it actually arrive looking trustworthy?

If you work as an independent consultant and send from your own domain (rather than a Gmail or Outlook address), this question deserves five minutes of your time, because the failure mode is silent. A submission that gets quarantined by the recipient's mail system produces no bounce, no error, and no "we didn't get it". You just hear nothing, and open calls already produce plenty of silence for ordinary reasons. It is worth being able to rule out the technical one.

The good news: you can check it yourself, without touching any settings, and you can check emails you sent months ago.

### Why emails go missing without a trace

Every email carries a kind of **ID check**. When your message arrives, the receiving system asks three questions:

1. **Did it come from a server that is allowed to send for this address?** (This is called *SPF*.)
2. **Does it carry a valid digital signature from the sender's domain?** Think of it as a wax seal proving nobody forged or altered it. (This is called *DKIM*.)
3. **What did the sender's domain say to do if the first two fail?** The options are "let it through anyway", "put it in spam" or "throw it away". (This is called *DMARC*.)

UN agencies, INGOs and donors almost all run Microsoft 365 or Google Workspace, and both take these checks seriously. Procurement inboxes in particular tend to sit behind strict filtering. If your email fails the ID check, it may land in a quarantine folder nobody opens, or be dropped outright.

Things that break the ID check without you noticing:

- You changed email provider, or moved to a new account with the same provider.
- Whoever set up your domain years ago only half finished the job.
- A website builder, newsletter tool or CRM sends mail "as you" without being authorised to.

The first one was my case, and it is the most common for solo consultants: we change tools more often than organisations do, and nobody is paid to check the plumbing afterwards.

### The check: send yourself an email and read the verdict

You need two things: your work email, and a personal Gmail or Outlook.com address.

**1. Send a normal email** from your work address to your personal one. Any text will do.

**2a. In Gmail:** open the message, click the three dots **⋮** at the top right, and choose **Show original**. A page opens with a small table at the top:

| | |
|---|---|
| SPF: | **PASS** with IP … |
| DKIM: | **PASS** with domain mydomain.org |
| DMARC: | **PASS** |

**2b. In Outlook.com:** open the message, click **…** → **View** → **View message source**. It is a wall of text, so search it (Ctrl+F) for `dkim=`, `spf=` and `dmarc=`, and look at the word that follows each.

**3. Read the result:**

- **Three times PASS, and the DKIM line names *your* domain:** you are fine. Your emails carry a valid ID.
- **DKIM passes, but with your provider's domain** (for example *google.com* or *sendgrid.net* instead of yours): it works, but only partly. Ask for it to be fixed (see below).
- **Any FAIL, or "none":** this is a real problem. Large organisations may be filtering your mail.

Do the test with **both** a Gmail and an Outlook address if you can. Between them they cover nearly every recipient you will ever write to in this sector.

### Checking the past, not just today

If you have just changed provider, the more interesting question is about the emails you sent *before* the move. The trick: **the receiver's copy keeps the verdict forever.** Your own *Sent* folder does not, because it holds the message before anyone checked it.

So search your personal Gmail or Outlook for anything you ever sent yourself from the work address: a forwarded document, a copy of a submission, a note to self. Open *Show original* on each one. I found emails from March and August in my own inbox and read the verdict on both. That gave me a clean answer for the whole period, in less time than it takes to write this paragraph.

If you have ever cc'd yourself on a proposal, you already have the evidence.

### What this test can't tell you

Passing the ID check means your email *can* be trusted. It does not guarantee that a particular organisation's filter let it through. Those filters also weigh links, attachments, and how new your domain is. A freshly registered domain sending a 20 MB PDF to a procurement address is a textbook case for extra scrutiny.

There is only one sure way to know whether a specific submission arrived: **ask, through a different channel.** A short LinkedIn message or a call to the focal point ("just confirming that my submission of the 8th reached you") feels awkward the first time. It is normal practice, procurement teams are used to it, and it settles the question in a way no technical check can.

### If something fails: what to ask for

You do not need to fix it yourself. Send this to whoever manages your email or domain (your provider's support, your web agency, or the friend who set it up):

> Emails from *@mydomain.org* are failing the SPF / DKIM / DMARC check (screenshot attached). Can you please:
>
> 1. set up DKIM signing with my own domain,
> 2. make sure SPF lists every service that sends email for me (email provider, newsletter tool, CRM),
> 3. add a DMARC record, starting with `p=none` plus a reporting address, so I can see what fails before tightening it.

Point 3 matters more than it looks. When I checked mine, the policy was strict but there was **no reporting address**, so if something had broken, nobody would have told me. There is one now: every day the big providers send a short report on who sent mail in my name and whether it passed. For a one-person business this is the closest thing to an early warning system you will get.

**One more tip:** if you own a domain you *don't* use for email (an old project name, a spare web address), ask for it to be marked as "sends no email". Otherwise someone can send convincing messages in your name from it, and you will never know.

### The short version

- Send yourself an email from work to Gmail and/or Outlook.
- In Gmail, **⋮ → Show original**. In Outlook, **… → View → View message source**.
- You want **PASS** three times, with your own domain on the DKIM line.
- Check an old email you sent yourself to cover the past, not just today.
- If it fails, forward the screenshot and the three requests above to whoever runs your email.
- If one particular submission really matters, confirm with the focal point through another channel.
