# COURSE cyber | Cybersecurity | Security | 🔐 | 3 | Junior / Senior | #a855f7
> Think like a defender: threats, passwords and authentication, cryptography, and network defense. Only ever test systems you have permission to test.

## UNIT cy1 | Security Foundations

### LESSON The CIA triad and threats | 10
Every security decision protects one or more parts of the **CIA triad**:

| | Means | Attack example |
|---|---|---|
| **Confidentiality** | Only the right people can see the data | a data leak |
| **Integrity** | The data hasn't been secretly changed | tampering with grades |
| **Availability** | The system works when people need it | a DDoS attack |

### Key terms
- **Vulnerability:** a weakness, like an unpatched bug or a weak password.
- **Threat:** something that could exploit a vulnerability.
- **Risk:** how likely an attack is, combined with how much damage it would do.

### Malware
- **Virus:** attaches to files and spreads when the files are run.
- **Worm:** spreads **by itself** across networks. It doesn't need a host file.
- **Trojan:** pretends to be something useful.
- **Ransomware:** encrypts your files and demands payment.
- **Spyware / keylogger:** secretly watches what you do.

### Social engineering
Social engineering attacks target **people**, not computers. Examples include **phishing** (fake messages), **pretexting** (a made-up story, like "I'm from IT"), **tailgating** (following someone through a locked door) and **baiting** (a "free" USB drive).

### Ethics and the law
Only test systems you **own** or have **written permission** to test. Unauthorized access is illegal, even if you were "just curious". In the US it falls under the Computer Fraud and Abuse Act. **White-hat** hackers work with permission and report what they find responsibly.

### QUIZ
Q: What do the letters in the CIA triad stand for?
- [ ] Control, Identity, Access
- [x] Confidentiality, Integrity, Availability
- [ ] Cryptography, Internet, Authentication
- [ ] Confidentiality, Identity, Authorization
WHY: These are the three goals of information security.

Q: A DDoS attack floods a website with traffic until it goes down. Which part of the CIA triad does it attack?
- [ ] Confidentiality
- [ ] Integrity
- [x] Availability
- [ ] All three equally
WHY: The data isn't stolen or changed. The site just becomes **unavailable**.

Q: Which kind of malware spreads across a network by itself, without attaching to a file?
- [ ] Virus
- [x] Worm
- [ ] Trojan
- [ ] Adware
WHY: Worms self-replicate across networks. Viruses need a host file to spread.

Q: Someone follows an employee through a secure door without swiping a badge. What is this called?
- [ ] Phishing
- [x] Tailgating
- [ ] Spoofing
- [ ] Baiting
WHY: Tailgating (also called piggybacking) is a physical social engineering attack.

Q: When is it OK to run a security scan on a website?
- [ ] Whenever you're curious
- [ ] If the site looks insecure
- [x] Only if you own it or have written permission
- [ ] Only on weekends
WHY: Testing without authorization is illegal. Ethical hackers always get permission first.

Q: An attacker changes students' grades in a database. Which part of the CIA triad is violated?
- [ ] Availability
- [x] Integrity
- [ ] Confidentiality
- [ ] None of them
WHY: Integrity means data hasn't been altered without authorization.

### LESSON Security controls and zero trust | 10 | Sec+ 1.1, 1.2
A **control** is anything that reduces risk. Security+ sorts controls two ways.

**By category** (what kind of thing it is):
| Category | Examples |
|---|---|
| Technical | Firewalls, encryption, antivirus, MFA |
| Managerial | Policies, risk assessments, security plans |
| Operational | Training, guards doing patrols, backups done by people |
| Physical | Locks, fences, badge readers, cameras |

**By type** (what it does):
| Type | Goal | Example |
|---|---|---|
| Preventive | Stop it from happening | Locked door, firewall rule |
| Deterrent | Discourage the attacker | Warning sign, visible camera |
| Detective | Notice it happened | Alarm, log review, IDS |
| Corrective | Fix it afterward | Restoring from backup, patching |
| Compensating | Stand in when the main control isn't possible | Extra monitoring on an old system that can't be patched |

### AAA and non-repudiation
- **Authentication:** proving who you are.
- **Authorization:** what you're allowed to do.
- **Accounting:** keeping records (logs) of what you did.
- **Non-repudiation:** proof someone did something that they can't deny later. Digital signatures provide it.

### Zero trust
Old networks trusted anything **inside** the firewall. **Zero trust** means "never trust, always verify": every user and device is checked every time it asks for something, no matter where it is, and gets only the access it needs (**least privilege**).

### QUIZ
Q: A school installs a camera in the server room and posts a sign that says "This area is monitored." Which control types does the camera with the sign provide?
PTS: 1
OPT I: Deterrent
OPT II: Detective
OPT III: Corrective
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: The visible camera and sign discourage intruders (deterrent), and the recording shows what happened (detective). A camera doesn't fix anything afterward, so it isn't corrective.

Q: An employee says she never sent an email that harmed the company. The email was digitally signed with her private key. Which security concept proves she sent it?
- [ ] Availability
- [ ] Authorization
- [x] Non-repudiation
- [ ] Obfuscation
WHY: Only the holder of the private key could have made that signature, so she can't deny sending it.

Q: Which of the following is an example of a managerial control?
PTS: 1
- [ ] A firewall that blocks port 23
- [x] A written policy requiring passwords to be changed after a breach
- [ ] A fence around the parking lot
- [ ] Antivirus software
WHY: Managerial controls are policies, plans and procedures. The firewall and antivirus are technical controls, and the fence is physical.

Q: A ransomware attack encrypts a hospital's patient records so doctors can't open them. Which part of the CIA triad is most directly affected?
- [ ] Confidentiality
- [ ] Integrity
- [x] Availability
- [ ] Authentication
WHY: The data still exists and wasn't necessarily changed or leaked, but the people who need it can't get to it.

Q: Which of the following statements describe a zero trust approach?
PTS: 1
OPT I: A laptop is checked every time it requests access to a resource, even inside the school network.
OPT II: Users get only the access they need for their job.
OPT III: Once a device passes the firewall, it is trusted for the rest of the day.
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: Zero trust never assumes something is safe because of where it is. III describes the old "castle and moat" model.

## UNIT cy2 | Passwords & Access Control

### LESSON Passwords, hashing and authentication | 12
### Never store plain passwords
Websites should store a **hash** of each password. A hash is a one-way fingerprint that can't be turned back into the password. At login, the site hashes what you typed and compares the two hashes.

A **salt** is random data added to each password before hashing. It makes identical passwords produce different hashes and defeats precomputed **rainbow tables**.

### Password attacks
- **Brute force:** try every possible combination.
- **Dictionary attack:** try common words and passwords that leaked in past breaches.
- **Credential stuffing:** reuse passwords leaked from *other* sites.

### Password strength (entropy)
The number of possible passwords is **characters^length**. **Length matters most**: 26¹² is about 457,000 times bigger than 26⁸ (that's 26⁴).

A long passphrase like `correct-horse-battery-staple` beats a short password like `P@ss1!`.

### Authentication factors
- Something you **know**: a password or PIN
- Something you **have**: a phone or a security key
- Something you **are**: a fingerprint or your face

**MFA** combines two or more different factors.

### Authorization and least privilege
- **Authentication** checks *who you are*.
- **Authorization** decides *what you're allowed to do*.
- The **principle of least privilege** says to give people only the access they need.

### Linux file permissions
Linux shows permissions as `rwx` (read, write, execute) for the **owner**, the **group** and **others**. Each permission is a number: r = 4, w = 2, x = 1. So `chmod 754 file` means owner rwx (7), group r-x (5) and others r-- (4).

### QUIZ
Q: Why do websites store password **hashes** instead of the passwords themselves?
- [ ] Hashes are shorter
- [x] If the database leaks, attackers don't directly get the passwords
- [ ] Hashing makes login faster
- [ ] So admins can read the passwords later
WHY: Hashes are one-way. Even if they leak, attackers still have to guess the original passwords.

Q: What does adding a **salt** to each password before hashing prevent?
- [ ] Brute-force attacks entirely
- [x] Precomputed rainbow-table attacks, and identical passwords having the same hash
- [ ] Phishing
- [ ] Keyloggers
WHY: Each user gets a unique salt, so attackers can't use one precomputed table for everyone.

Q: Which password is strongest?
- [ ] `P@ssw0rd!`
- [ ] `Tr0ub4dor`
- [x] `purple-tiger-moon-skate-42`
- [ ] `qwerty123`
WHY: Length adds the most entropy. A long, random passphrase beats short passwords with symbols swapped in.

Q: What permissions does `chmod 640 notes.txt` give?
- [x] Owner: rw-, group: r--, others: ---
- [ ] Owner: rwx, group: r--, others: ---
- [ ] Owner: r--, group: rw-, others: ---
- [ ] Everyone can read and write
WHY: 6 = 4 + 2 (rw), 4 = r, and 0 = no permissions.

Q: A new intern gets access only to the folders their job needs. Which principle is this?
- [ ] Defense in depth
- [x] Least privilege
- [ ] Security through obscurity
- [ ] Availability
WHY: Least privilege limits the damage if an account is ever compromised.

Q: What is the difference between authentication and authorization?
- [x] Authentication checks who you are; authorization decides what you can do
- [ ] They mean the same thing
- [ ] Authorization checks who you are; authentication decides what you can do
- [ ] Authentication is only used for passwords
WHY: Logging in is **authentication**. Being allowed into the admin page is **authorization**.

### TRACE
Q: What permission string does `ls -l` show after this command?
```bash
$ chmod 754 script.sh
$ ls -l script.sh
```
- [ ] -rwxrwxr--
- [x] -rwxr-xr--
- [ ] -rw-r-xr--
- [ ] -rwxr--r-x
WHY: 7 = rwx (owner), 5 = r-x (group), 4 = r-- (others).

### BUG
Q: Click the line with the security flaw.
```python
def create_account(db, username, password):
    if username in db:
        return "Username taken"
    db[username] = password
    return "Account created"
```
LINE: 4
FIX: db[username] = hash_with_salt(password)   # e.g. bcrypt or argon2
WHY: The password is stored in **plain text**. If the database leaks, every password leaks too. Store a salted hash instead.

## UNIT cy3 | Cryptography

### LESSON From Caesar ciphers to HTTPS | 13
### Classical ciphers
A **Caesar cipher** shifts every letter by a fixed amount. With a shift of 3, `A→D`, `B→E` and `Z→C`. There are only **25** useful keys, so it's easy to brute-force.

A **substitution cipher** maps each letter to a different letter. It can be broken with **frequency analysis**, because in English, **E**, T and A are the most common letters.

### Modern encryption
- **Symmetric** encryption (like AES) uses **one shared key** to encrypt and decrypt. It's fast, but you have to share the key safely.
- **Asymmetric** encryption (public key, like RSA) uses a **key pair**. Anyone can encrypt with your **public** key, but only your **private** key can decrypt.

HTTPS uses asymmetric encryption to **agree on a symmetric key** safely, and then uses that fast symmetric key for the rest of the connection.

### Hashing vs. encryption
- **Encryption** is **two-way**: with the key, you can get the data back.
- **Hashing** (like SHA-256) is **one-way**: you can't get the original back. Hashes are used to check integrity and to store passwords.

### Digital signatures
To sign, you encrypt a hash of a message with your **private** key. Anyone can check the signature with your **public** key. This proves **who** sent the message (authenticity) and that it wasn't **changed** (integrity).

### QUIZ
Q: What is `CAT` encrypted with a Caesar cipher, shift 3?
- [x] FDW
- [ ] DBU
- [ ] ZXQ
- [ ] FEW
WHY: C→F, A→D, T→W.

Q: Why is a Caesar cipher easy to break?
- [ ] It uses binary
- [x] There are only 25 possible shifts, so you can try them all
- [ ] The key is always 3
- [ ] It only works on vowels
WHY: Such a tiny keyspace makes brute force trivial.

Q: Which technique breaks simple substitution ciphers?
- [ ] Rainbow tables
- [x] Frequency analysis
- [ ] Port scanning
- [ ] Hashing
WHY: Letter frequencies survive substitution. The most common symbol is probably E.

Q: In public key encryption, which key decrypts a message that was encrypted with your public key?
- [ ] Your public key
- [x] Your private key
- [ ] The sender's private key
- [ ] Any key
WHY: The keys work as a pair. What the public key locks, only the matching private key unlocks.

Q: Which statement about hashing is TRUE?
- [ ] Hashing can be reversed with the right key
- [x] Hashing is one-way, and the same input always gives the same hash
- [ ] Hashing is the same as encryption
- [ ] Hashes are always longer than the input
WHY: Hashes are one-way and deterministic (the same input always gives the same output), which is why they're used for integrity checks and password storage.

Q: What does a digital signature prove?
- [ ] That the message is secret
- [x] Who sent the message, and that it wasn't changed
- [ ] That the message was sent quickly
- [ ] That the receiver read it
WHY: A signature gives you **authenticity** and **integrity**, but not confidentiality.

### TRACE
Q: What is printed?
```python
def caesar(text, shift):
    out = ""
    for ch in text:
        out += chr((ord(ch) - 65 + shift) % 26 + 65)
    return out

print(caesar("XYZ", 3))
```
- [ ] [\]
- [x] ABC
- [ ] XYZ
- [ ] ABD
WHY: `% 26` wraps past Z: X(23) + 3 = 26 → 0 = A, then B, then C.

### BUG
Q: `decrypt(caesar("HELLO", 5), 5)` should give back "HELLO", but it doesn't. Click the bug.
```python
def decrypt(text, shift):
    out = ""
    for ch in text:
        out += chr((ord(ch) - 65 + shift) % 26 + 65)
    return out
```
LINE: 4
FIX: out += chr((ord(ch) - 65 - shift) % 26 + 65)
WHY: To decrypt, you shift **backward**, so subtract the shift. Python's `%` handles negative numbers correctly.

## UNIT cy4 | Networks & Defense

### LESSON Ports, firewalls and web attacks | 13
### Common ports
| Port | Service |
|---|---|
| 22 | SSH (secure remote login) |
| 25 | SMTP (email) |
| 53 | DNS |
| 80 | HTTP |
| 443 | HTTPS |

### Network defenses
- **Firewall:** allows or blocks traffic based on rules (such as which ports and addresses are allowed).
- **IDS/IPS:** detects (and may block) suspicious activity.
- **VPN:** an encrypted tunnel that protects traffic on untrusted networks.
- **Patching:** fixes known vulnerabilities. Many attacks use bugs that already had a fix available.
- **Logs:** records you review to spot attacks, like 500 failed logins from one IP address.

### Defense in depth
Use **multiple layers** of security, so that if one fails, another still protects you.

### Web attacks
**SQL injection** happens when user input is pasted directly into a database query:

```sql
SELECT * FROM users WHERE name = '' OR '1'='1'
```

The fix is **parameterized queries** (also called prepared statements), which treat input as data, never as code.

**XSS (cross-site scripting)** happens when an attacker injects a script into a page that other people view. The fix is to escape output and to use `textContent` instead of `innerHTML`.

**Input validation:** never trust input from users. Check its type, length and format on the **server**.

### QUIZ
Q: Which port does HTTPS use by default?
- [ ] 80
- [ ] 22
- [x] 443
- [ ] 53
WHY: HTTP uses 80 and HTTPS uses 443.

Q: What does a firewall do?
- [ ] Encrypts your hard drive
- [x] Allows or blocks network traffic based on rules
- [ ] Removes viruses
- [ ] Speeds up the network
WHY: Firewalls filter traffic, for example by blocking ports that should never be reachable.

Q: A user types `' OR '1'='1` into a login box and gets in. What attack is this?
- [ ] XSS
- [x] SQL injection
- [ ] Phishing
- [ ] DDoS
WHY: The input changes the SQL query's logic, so the WHERE clause is always true.

Q: What is the best defense against SQL injection?
- [ ] Hiding the login page
- [ ] Making users type slowly
- [x] Parameterized queries (prepared statements)
- [ ] Using HTTPS
WHY: Parameters keep user input as **data**, so it can never be run as SQL code.

Q: What does **defense in depth** mean?
- [ ] One very strong firewall
- [x] Several layers of security, so one failure isn't fatal
- [ ] Hiding servers underground
- [ ] Encrypting everything twice
WHY: Layered defenses like firewalls, MFA, patching and monitoring back each other up.

Q: A log shows 500 failed logins in 2 minutes from one IP address. What is the most likely explanation?
- [ ] A forgetful user
- [x] A brute-force or password-guessing attack
- [ ] A DNS failure
- [ ] Normal traffic
WHY: Defenses include rate limiting, account lockouts and MFA.

### BUG
Q: Click the line that makes this login vulnerable to attack.
```python
def login(db, username, password):
    pw_hash = hash_password(password)
    query = "SELECT * FROM users WHERE name = '" + username + "' AND pw = '" + pw_hash + "'"
    return db.execute(query)
```
LINE: 3
FIX: return db.execute("SELECT * FROM users WHERE name = ? AND pw = ?", (username, pw_hash))
WHY: Building SQL by gluing strings together allows **SQL injection**. Use a parameterized query instead.

## UNIT cy5 | System Hardening: Windows & Linux
### LESSON Hardening a Windows computer | 11 | CyberPatriot
**Hardening** means removing ways a system could be attacked. It's exactly what CyberPatriot teams do on their practice images.

### Accounts
- Delete or disable accounts that shouldn't exist, including **Guest**.
- Only people who need it should be in the **Administrators** group.
- Rename or disable the built-in Administrator account if your rules allow it.
- Give every account a strong password.

### Local Security Policy (`secpol.msc`)
| Setting | Typical secure value |
|---|---|
| Minimum password length | 10 or more characters |
| Maximum password age | 60–90 days |
| Password must meet complexity requirements | Enabled |
| Store passwords using reversible encryption | **Disabled** |
| Account lockout threshold | About 5–10 bad attempts |
| Audit logon events | Success and failure |

### Services, updates and the firewall
- Turn on **Windows Update** and install updates.
- Make sure **Windows Defender Firewall** and **Microsoft Defender Antivirus** are on.
- Stop and disable services you don't need, like Remote Desktop, Telnet or FTP, unless the scenario says they're required.
- Remove **prohibited software** (hacking tools, games on a work machine) and **prohibited files** (like music files where they aren't allowed).

> Always read the scenario first. Disabling a service that the business actually needs costs points.

### LESSON Hardening a Linux computer | 12 | CyberPatriot
### Key commands
| Command | What it does |
|---|---|
| `sudo command` | Run one command as the administrator (root) |
| `sudo apt update && sudo apt upgrade` | Update the list of packages, then install updates |
| `sudo ufw enable` | Turn on the Uncomplicated Firewall |
| `sudo ufw deny 23` | Block port 23 (Telnet) |
| `sudo passwd -l bob` | Lock bob's password |
| `sudo deluser bob` | Delete user bob |
| `sudo deluser bob sudo` | Remove bob from the admin (sudo) group |
| `sudo systemctl disable --now telnet.socket` | Stop a service and keep it from starting |
| `ls -l` | List files with their permissions |
| `grep "Failed" /var/log/auth.log` | Find failed login attempts |

### Important files
- `/etc/passwd` lists user accounts (anyone can read it).
- `/etc/shadow` holds password **hashes** and must be readable only by root.
- `/etc/group` lists groups. Members of `sudo` (or `wheel`) are admins.
- `/etc/ssh/sshd_config` has SSH settings. Set `PermitRootLogin no`.
- `/etc/login.defs` has password aging settings like `PASS_MAX_DAYS 90`.

### File permissions
`ls -l` shows something like `-rwxr-x---`. After the first character (file type), there are three groups of three: **owner**, **group**, **others**. Each is **r**ead (4), **w**rite (2) and e**x**ecute (1).

| Number | Letters | Meaning |
|---|---|---|
| 7 | rwx | 4 + 2 + 1 |
| 6 | rw- | 4 + 2 |
| 5 | r-x | 4 + 1 |
| 4 | r-- | 4 |
| 0 | --- | nothing |

So `chmod 640 grades.txt` gives the owner read/write, the group read-only and everyone else nothing: `-rw-r-----`.

### QUIZ
Q: Consider the following command.
PTS: 1
```bash
chmod 754 backup.sh
```
ASK: Which permissions does `backup.sh` have after the command runs?
- [x] `-rwxr-xr--`
- [ ] `-rwxr-x-r-`
- [ ] `-rw-r-xr--`
- [ ] `-rwxrw-r--`
WHY: 7 = rwx for the owner, 5 = r-x for the group, 4 = r-- for everyone else.

Q: A file is listed as `-rw-rw-rw-`. Which `chmod` command gives that permission?
- [ ] `chmod 777`
- [x] `chmod 666`
- [ ] `chmod 644`
- [ ] `chmod 555`
WHY: rw- is 4 + 2 = 6 for each of the three groups. Letting everyone write a file is usually a security problem.

Q: The scenario for a Linux image says the only authorized administrators are `alice` and `ben`. Which of the following commands help secure the system?
PTS: 1
OPT I: `sudo deluser carl sudo` (carl is an authorized standard user who is in the sudo group)
OPT II: `sudo ufw enable`
OPT III: `sudo chmod 777 /etc/shadow`
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: I removes admin rights from someone who shouldn't have them, and II turns on the firewall. III would let every user read and change the password hashes, which is a serious vulnerability.

Q: Which Windows Local Security Policy setting should be **disabled**?
- [ ] Password must meet complexity requirements
- [x] Store passwords using reversible encryption
- [ ] Audit account logon events
- [ ] Account lockout threshold
WHY: Reversible encryption is basically like storing passwords in plain text. The others should be turned on.

Q: Which file should only be readable by root on a Linux system?
- [ ] /etc/passwd
- [x] /etc/shadow
- [ ] /etc/hostname
- [ ] /home/alice/notes.txt
WHY: /etc/shadow stores the password hashes. /etc/passwd lists accounts and is meant to be readable by everyone.

Q: An administrator runs the following command. What does it show?
PTS: 1
```bash
grep "Failed password" /var/log/auth.log | wc -l
```
- [ ] The list of all users' passwords
- [x] How many lines in the authentication log record a failed password attempt
- [ ] Every successful login
- [ ] It deletes the failed attempts from the log
WHY: `grep` keeps the lines containing "Failed password", and `wc -l` counts them. A big number could mean a brute-force attack.

## UNIT cy6 | Security Operations & Incident Response
### LESSON Incident response | 11 | Sec+ 4.8
When an attack happens, teams follow a plan. The NIST incident response steps are:

1. **Preparation:** plans, tools, training and backups *before* anything happens.
2. **Detection and analysis:** noticing something is wrong (alerts, logs, a user report) and figuring out what it is.
3. **Containment:** stopping it from spreading, such as unplugging an infected computer from the network.
4. **Eradication:** removing the cause (deleting malware, closing the hole).
5. **Recovery:** getting systems back to normal and watching them closely.
6. **Lessons learned:** a meeting afterward about what to improve.

### Evidence
- Keep a **chain of custody**: a record of everyone who handled the evidence, and when.
- Collect the most **volatile** evidence first. Memory (RAM) disappears when power goes off, so capture it before the disk.
- Work on a **copy** of the disk, and record its **hash** to prove it wasn't changed.

### Logs and monitoring
A **SIEM** (security information and event management) tool gathers logs from many systems in one place and raises alerts. An **IDS** detects suspicious traffic, and an **IPS** detects it *and* blocks it.

### LESSON Risk, vulnerabilities and backups | 10 | Sec+ 4.3, 5.2
### Risk
**Risk ≈ likelihood × impact.** Organizations can respond to a risk four ways:
| Response | Meaning | Example |
|---|---|---|
| Mitigate | Reduce it | Add MFA |
| Transfer | Make someone else carry it | Buy cyber insurance |
| Avoid | Stop doing the risky thing | Turn off an unneeded service |
| Accept | Live with it | The fix costs more than the possible loss |

### Finding vulnerabilities
- A **vulnerability scan** checks systems for known weaknesses. Each is listed as a **CVE** and rated by **CVSS** (0–10; 9.0+ is critical).
- A **penetration test** has an authorized expert actually try to break in. It always needs **written permission** first.
- **Patch management** means testing and installing updates on a schedule.

### Backups: the 3-2-1 rule
Keep **3** copies of important data, on **2** different kinds of storage, with **1** copy offsite (or offline). An offline copy can't be encrypted by ransomware.

### QUIZ
Q: A student's laptop shows a ransom note, and files on the school's shared drive are starting to be encrypted. According to the incident response process, what should the IT team do FIRST?
PTS: 1
- [ ] Hold a lessons-learned meeting.
- [ ] Reinstall the operating system on every school computer.
- [x] Disconnect the infected laptop from the network.
- [ ] Pay the ransom.
WHY: Containment comes before eradication and recovery. Disconnecting stops the encryption from spreading to more files.

Q: Which of the following are examples of risk transfer?
PTS: 1
OPT I: Buying cyber insurance
OPT II: Paying a cloud company to run the email server under a contract that makes it responsible for security
OPT III: Turning off an online feature that collects credit card numbers
- [ ] I only
- [x] I and II only
- [ ] II and III only
- [ ] I, II and III
WHY: I and II move some of the risk's cost to another party. Turning off the feature removes the risk, which is avoidance.

Q: Which order of collecting evidence follows the order of volatility?
- [x] RAM, then the hard drive, then backups
- [ ] Backups, then the hard drive, then RAM
- [ ] The hard drive, then RAM, then backups
- [ ] Order does not matter
WHY: RAM is lost when the computer turns off, so it must be captured first. Backups are the least volatile.

Q: Consider the following Python code, which scans a web server log.
PTS: 1
```python
log = ["10.0.0.5 GET /login 401",
       "10.0.0.5 GET /login 401",
       "10.0.0.9 GET /home 200",
       "10.0.0.5 GET /login 401",
       "10.0.0.9 GET /login 200"]
fails = {}
for line in log:
    ip, method, page, status = line.split()
    if status == "401":
        fails[ip] = fails.get(ip, 0) + 1
for ip, n in fails.items():
    if n >= 3:
        print("ALERT", ip, n)
```
ASK: What is printed as a result of executing the code segment?
- [x] ALERT 10.0.0.5 3
- [ ] ALERT 10.0.0.5 3, then ALERT 10.0.0.9 1
- [ ] ALERT 10.0.0.9 2
- [ ] Nothing is printed.
WHY: Status 401 means a failed login. 10.0.0.5 has three, which reaches the threshold. 10.0.0.9 has no failures. This is a tiny version of what a SIEM rule does.

Q: Which of the following does the 3-2-1 backup rule require?
PTS: 1
OPT I: Three copies of the data
OPT II: Two different kinds of storage media
OPT III: One copy kept offsite or offline
- [ ] I only
- [ ] I and II only
- [ ] II and III only
- [x] I, II and III
WHY: That is the whole rule: 3 copies, 2 media types and 1 offsite.

Q: A vulnerability scanner reports a flaw with a CVSS score of 9.8. What does this mean?
- [ ] The system is 98% secure.
- [x] The flaw is critical and should be patched as soon as possible.
- [ ] The flaw has already been exploited 98 times.
- [ ] It is a low-priority finding.
WHY: CVSS rates severity from 0 to 10. Anything 9.0 or higher is critical.

Q: Which is the key difference between an IDS and an IPS?
- [ ] An IDS is software and an IPS is hardware.
- [x] An IDS alerts on suspicious traffic; an IPS can also block it.
- [ ] An IPS only works on wireless networks.
- [ ] There is no difference.
WHY: Detection only reports. Prevention also takes action.
