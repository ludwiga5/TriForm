package services;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.Keys;
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

    //Injects
    public JwtService(UserRepository userRepository, JwtProperties jwtProperties){
        this.userRepository = userRepository;
        this.jwtProperties = jwtProperties;
    }

    //Generates a JWT token for a user
    public String generateToken(String username){

        User user = userRepository.findByUsername(username);
        long id = user.getId();

        //Convert Secret to Key
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtProperties.getSecret()));

        //Build Token
        String token = Jwts.builder()
        .setSubject(username)
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis()+3600000))
        .claim("userId", id)
        .signWith(key)
        .compact();

        return token;

        
    //Extracts username from token
    } public String extractUsername(String token){

        //Convert Secret to Key
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtProperties.getSecret()));

        //Parse for Username
        String username = Jwts.parserBuilder()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token)
        .getBody()
        .getSubject();

        return username;

    //Extracts userID from token
    } public Long extractId(String token){

        //Conver Secret to Key
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtProperties.getSecret()));

        //Parse for ID
        Long id = Jwts.parserBuilder()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token)
        .getBody()
        .get("userId", Long.class);

        return id;

    //Validates token
    } public void validateToken(String token){
        //Convert Secret to Key
        SecretKey key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtProperties.getSecret()));        
        //Checks token expiration
        try{
            
        //Parse for Expiration
        Jwts.parserBuilder()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token);
        }

        //Catch Invalid, Malformed, & Unsupported tokens later
        catch(ExpiredJwtException tokenExpired){
            throw new TokenExpiredException("Auth Expired");
        }

    }

}


