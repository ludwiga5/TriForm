package config;

//Imports
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;


public class DatabaseManager {

    //Handling Database Pathing
    public static String dbPath = "jdbc:sqlite:./data/triform.db";
    public static String templaceDbPath = "jdbc:sqlite:./src/main/resources/db/migration/triform.db";

    //Forms Database Connection & Sends pass/fail message & error
    public void connect(){

        try{
            Connection conn = DriverManager.getConnection(dbPath);
            if(conn != null){
                System.out.println("Connection Successful!");
                conn.close();
            }
        } catch (SQLException e){
            System.out.println("Connection Failed: " + e.getMessage());
        }
    }
}

