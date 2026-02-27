package services;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;
import jakarta.annotation.PostConstruct;
import entities.User;
import exceptions.TokenExpiredException;
import repositories.UserRepository;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

import config.JwtProperties;import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {
    
    private final UserRepository userRepository;
    private final JwtProperties jwtProperties;

    private SecretKey secretKey;

    //Injects
    public JwtService(UserRepository userRepository, JwtProperties jwtProperties){
        this.userRepository = userRepository;
        this.jwtProperties = jwtProperties;
    }

    //Checks validity of JWT_SECRET and updates if failure occurs
    @PostConstruct
    private void keyCheck(){

        //generate new JWT_SECRET value if missing or null
        String keyConfigured = jwtProperties.getSecret();
        if(keyConfigured == null || keyConfigured.isEmpty()){
            secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            String base64Key = Base64.getEncoder().encodeToString(secretKey.getEncoded());
            System.out.println("Generated new JWT_SECRET (base64). Add to .env file. JWT_SECRET="+base64Key);
            return;
        }

        //used to remove invalid base64 characters
        keyConfigured = keyConfigured.trim();

        //tries to make a new secret. If weak run HS256 key algorithm.
        try{
            byte[] decoded = Base64.getDecoder().decode(keyConfigured);
            this.secretKey = Keys.hmacShaKeyFor(decoded);
        } catch(IllegalArgumentException | WeakKeyException e){
            this.secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            String b64 = Base64.getEncoder().encodeToString(secretKey.getEncoded());
            System.out.println("Provided JWT_SECRET was too weak. Generated new JWT_SECRET (base64): " + b64);
        }
    }


    //Generates a JWT token for a user
    public String generateToken(String username){

        User user = userRepository.findByUsername(username);
        long id = user.getId();

        //Build Token
        String token = Jwts.builder()
        .setSubject(username)
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis()+3600000))
        .claim("userId", id)
        .signWith(this.secretKey)
        .compact();

        return token;

        
    //Extracts username from token
    } public String extractUsername(String token){

        //Parse for Username
        String username = Jwts.parserBuilder()
        .setSigningKey(this.secretKey)
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject();

        return username;

    //Extracts userID from token
    } public Long extractId(String token){

        //Parse for ID
        Long id = Jwts.parserBuilder()
        .setSigningKey(this.secretKey)
        .build()
        .parseClaimsJws(token)
        .getBody()
        .get("userId", Long.class);

        return id;

    //Validates token
    } public void validateToken(String token){
   
        //Checks token expiration
        try{
            
        //Parse for Expiration
        Jwts.parserBuilder()
        .setSigningKey(this.secretKey)
        .build()
        .parseClaimsJws(token);
        }

        //Catch Invalid, Malformed, & Unsupported tokens later
        catch(ExpiredJwtException tokenExpired){
            throw new TokenExpiredException("Auth Expired");
        }

    }

}


