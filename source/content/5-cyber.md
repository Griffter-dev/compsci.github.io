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
